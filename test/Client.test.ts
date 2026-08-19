import { Http, Sources } from "skyportal-js";
import { createClient } from "skyportal-js/Client";
import { describe, expect, it } from "vitest";

const BASE_URL = "https://skyportal.example.com";

/** Record every request the client makes and reply with a canned envelope. */
const stubClient = (reply: (request: Request) => Response) => {
    const requests: Array<Request> = [];
    const client = createClient(BASE_URL, {
        token: "abc123",
        fetch: (input, init) => {
            const request = new Request(input, init);
            requests.push(request);
            return Promise.resolve(reply(request));
        },
    });
    return { client, requests };
};

const envelope = (data: unknown): Response => new Response(JSON.stringify({ status: "success", data }));

describe("createClient", () => {
    it("sends the token header and resolves paths against the base URL", async () => {
        const { client, requests } = stubClient(() => envelope({ id: "ZTF20abcdef", ra: 10.5, dec: -20.25 }));

        await client.fetchSource("ZTF20abcdef");

        const request = requests[0];
        expect(new URL(request.url).origin + new URL(request.url).pathname).toBe(`${BASE_URL}/api/sources/ZTF20abcdef`);
        expect(request.headers.get("Authorization")).toBe("token abc123");
        expect(request.method).toBe("GET");
    });

    it("omits the token header when no token is configured", async () => {
        const requests: Array<Request> = [];
        const client = createClient(BASE_URL, {
            fetch: (input, init) => {
                requests.push(new Request(input, init));
                return Promise.resolve(envelope([]));
            },
        });

        await client.fetchTelescopes();

        expect(requests[0].headers.get("Authorization")).toBeNull();
    });

    it("binds every endpoint as a method equivalent to the standalone function", async () => {
        const { client } = stubClient(() => envelope({ id: "ZTF20abcdef", ra: 10.5 }));

        const viaMethod = await client.fetchSource("ZTF20abcdef");
        const viaFunction = await Sources.fetchSource(client, "ZTF20abcdef");

        expect(viaMethod).toEqual(viaFunction);
        expect(viaMethod.id).toBe("ZTF20abcdef");
    });

    it("maps camelCase options onto the endpoint's wire query parameters", async () => {
        const { client, requests } = stubClient(() => envelope({ sources: [{ id: "ZTF20abcdef" }], totalMatches: 42 }));

        const page = await client.fetchSources({
            numPerPage: 1,
            pageNumber: 2,
            groupIds: [1, 2],
            hasTnsName: true,
            classifications: ["Sitewide Taxonomy: Ia"],
        });

        const query = new URL(requests[0].url).searchParams;
        expect(query.get("numPerPage")).toBe("1");
        expect(query.get("pageNumber")).toBe("2");
        expect(query.get("group_ids")).toBe("1,2");
        expect(query.get("hasTNSname")).toBe("true");
        expect(query.get("classifications")).toBe("Sitewide Taxonomy: Ia");
        expect(page.totalMatches).toBe(42);
        expect(page.sources[0].id).toBe("ZTF20abcdef");
    });

    it("sends payloads as JSON with the fields the caller left unset removed", async () => {
        const { client, requests } = stubClient(() => envelope({ id: 7 }));

        await client.postTelescope({
            name: "Palomar 1.5m",
            nickname: "P60",
            diameter: 1.5,
            lat: 33.36,
        });

        const request = requests[0];
        expect(request.method).toBe("POST");
        expect(request.headers.get("Content-Type")).toBe("application/json");
        expect(await request.json()).toEqual({
            name: "Palomar 1.5m",
            nickname: "P60",
            diameter: 1.5,
            lat: 33.36,
            robotic: false,
        });
    });

    it("encodes a repeated query parameter once per value", async () => {
        const { client, requests } = stubClient(() => envelope({ totalMatches: 0 }));

        await client.fetchThumbnailPaths({ types: ["new", "ref"], requiredDepth: 2 });

        const query = new URL(requests[0].url).searchParams;
        expect(query.getAll("types")).toEqual(["new", "ref"]);
        expect(query.get("requiredDepth")).toBe("2");
    });

    it("returns raw bytes from the endpoints that serve files", async () => {
        const { client } = stubClient(() => new Response(new Uint8Array([137, 80, 78, 71])));

        const chart = await client.fetchSourceFinder("ZTF20abcdef", { outputType: "png" });

        expect(chart).toEqual(new Uint8Array([137, 80, 78, 71]));
    });

    it("raises SkyPortalError on an error envelope", async () => {
        const { client } = stubClient(
            () =>
                new Response(JSON.stringify({ status: "error", message: "Invalid object ID" }), {
                    status: 400,
                })
        );

        await expect(client.fetchSource("nope")).rejects.toThrow(Http.SkyPortalError);
    });
});
