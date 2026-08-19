import { Http } from "skyportal-js";
import { describe, expect, it } from "vitest";

describe("unwrap", () => {
    it("returns the data field of a success envelope", async () => {
        const response = new Response(JSON.stringify({ status: "success", data: { id: 1 } }));
        expect(await Http.unwrap(response)).toEqual({ id: 1 });
    });

    it("raises SkyPortalError carrying the server's message and status", async () => {
        const response = new Response(JSON.stringify({ status: "error", message: "nope" }), {
            status: 400,
        });
        await expect(Http.unwrap(response)).rejects.toMatchObject({
            name: "SkyPortalError",
            message: "nope",
            statusCode: 400,
        });
    });

    it("falls back to the status line when the body carries no message", async () => {
        const response = new Response(JSON.stringify({ status: "error" }), { status: 403 });
        await expect(Http.unwrap(response)).rejects.toThrow("HTTP 403");
    });

    it("reports a non-JSON body rather than throwing a parse error", async () => {
        const response = new Response("<html>502 Bad Gateway</html>", { status: 502 });
        await expect(Http.unwrap(response)).rejects.toThrow("SkyPortal returned a non-JSON response (HTTP 502)");
    });

    it("treats a 200 that is not a success envelope as an error", async () => {
        const response = new Response(JSON.stringify({ status: "error", message: "bad input" }));
        await expect(Http.unwrap(response)).rejects.toThrow("bad input");
    });
});

describe("unwrapContent", () => {
    it("returns the raw bytes of a successful response", async () => {
        const response = new Response(new Uint8Array([1, 2, 3]));
        expect(await Http.unwrapContent(response)).toEqual(new Uint8Array([1, 2, 3]));
    });

    it("raises SkyPortalError with the JSON message of a failure", async () => {
        const response = new Response(JSON.stringify({ message: "no such chart" }), {
            status: 404,
        });
        await expect(Http.unwrapContent(response)).rejects.toThrow("no such chart");
    });
});

describe("params", () => {
    it("drops null and undefined but keeps false and zero", () => {
        expect(Http.params({ a: 1, b: undefined, c: null, d: false, e: 0, f: "" })).toEqual({
            a: 1,
            d: false,
            e: 0,
            f: "",
        });
    });
});

describe("commaSeparated", () => {
    it("joins a list and passes undefined through", () => {
        expect(Http.commaSeparated([1, 2, 3])).toBe("1,2,3");
        expect(Http.commaSeparated(undefined)).toBeUndefined();
    });
});

describe("body", () => {
    it("strips the fields a payload did not set, but keeps explicit nulls", () => {
        expect(Http.body({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null });
    });
});
