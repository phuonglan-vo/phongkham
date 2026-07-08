import { defineConfig } from "@playwright/test";

export default defineConfig({

    testDir: "./tests/e2e",

    fullyParallel: false,

    retries: process.env.CI ? 2 : 0,

    workers: process.env.CI ? 1 : undefined,

    reporter: [
        ["list"],
        ["html"]
    ],

    use: {

        baseURL: "http://127.0.0.1:4173",

        trace: "on-first-retry",

        screenshot: "only-on-failure",

        video: "retain-on-failure"

    },

    webServer: {

        command: "npm run build && npm run preview:test",

        url: "http://127.0.0.1:4173",

        reuseExistingServer: !process.env.CI

    },

    projects: [

        {
            name: "chromium",

            use: {
                browserName: "chromium"
            }
        }

    ]

});