import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<string | null> = {
  async POST(req, _ctx) {
    return new Response(`Le sous-groupe "Foobar" sera composé de:
    - Foo Bar
    - Baz Buzz
    - Bizz Boos`);
  },
};
