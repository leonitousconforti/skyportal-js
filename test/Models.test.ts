import { Comments, Groups, Http, Photometry, Sources, Streams, Telescopes } from "skyportal-js";
import { describe, expect, it } from "vitest";

describe("strict models", () => {
    it("keeps a comment's conversation channel", () => {
        const comment = Http.decode(Comments.Comment, {
            id: 1,
            text: "hi",
            channel: "planning",
        });
        expect(comment.channel).toBe("planning");
    });

    it("rejects a field the client does not know about", () => {
        expect(() => Http.decode(Streams.Stream, { id: 1, name: "ztf", surprise: true })).toThrow(
            Http.SkyPortalValidationError
        );
    });

    it("names the offending field in the error message", () => {
        expect(() => Http.decode(Streams.Stream, { id: 1, name: "ztf", surprise: true })).toThrow(/surprise/);
    });

    it("accepts a payload carrying only the required fields", () => {
        expect(Http.decode(Streams.Stream, { id: 1, name: "ztf" })).toEqual({
            id: 1,
            name: "ztf",
        });
    });

    it("defaults list-valued fields to empty rather than undefined", () => {
        const source = Http.decode(Sources.Source, { id: "ZTF20abcdef" });
        expect(source.groups).toEqual([]);
        expect(source.photometry).toEqual([]);
        expect(source.duplicates).toEqual([]);
    });

    it("accepts the null a nullable column comes back as", () => {
        const telescope = Http.decode(Telescopes.Telescope, {
            id: 1,
            name: "Palomar 1.5m",
            lat: null,
            robotic: null,
        });
        expect(telescope.lat).toBeNull();
    });

    it("decodes the mutually recursive group / group-user pair", () => {
        const group = Http.decode(Groups.Group, {
            id: 1,
            name: "Program A",
            group_users: [{ id: 5, user_id: 3, group: { id: 1, name: "Program A" } }],
        });
        expect(group.group_users?.[0]?.group?.name).toBe("Program A");
    });

    it("decodes a source's saved-group join columns alongside the group itself", () => {
        const source = Http.decode(Sources.Source, {
            id: "ZTF20abcdef",
            groups: [{ id: 1, name: "Program A", active: true, saved_at: "2026-01-01T00:00:00" }],
        });
        expect(source.groups[0]?.name).toBe("Program A");
        expect(source.groups[0]?.active).toBe(true);
    });

    it("decodes a photometry point in magnitude space", () => {
        const point = Http.decode(Photometry.PhotometryPoint, {
            id: 1,
            obj_id: "ZTF20abcdef",
            mjd: 59000.5,
            filter: "ztfg",
            mag: 19.2,
            magerr: 0.1,
            limiting_mag: 20.5,
            magsys: "ab",
        });
        expect(point.mag).toBe(19.2);
        expect(point.annotations).toEqual([]);
    });
});
