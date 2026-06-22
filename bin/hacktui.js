#!/usr/bin/env bun

const themeArg = process.argv.indexOf("--theme")
if (themeArg !== -1 && themeArg + 1 < process.argv.length) {
	process.env.HACKTUI_THEME = process.argv[themeArg + 1]
}

const sourceEntry = new URL("../src/layout.tsx", import.meta.url)

if (await Bun.file(sourceEntry).exists()) {
	await import(sourceEntry.href)
} else {
	await import("../dist/layout.js")
}
