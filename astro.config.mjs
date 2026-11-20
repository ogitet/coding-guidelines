// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages（https://ogitet.github.io/coding-guidelines/）で公開する
	site: 'https://ogitet.github.io',
	base: '/coding-guidelines',
	integrations: [
		starlight({
			title: 'コーディング規約',
			locales: {
				root: { label: '日本語', lang: 'ja' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/ogitet/coding-guidelines',
				},
			],
			plugins: [starlightLlmsTxt()],
			sidebar: [
				{
					label: '1. この規約について',
					items: [
						'about/purpose-and-scope',
						'about/compliance-levels',
						'about/changelog',
					],
				},
				{
					label: '2. 基本方針',
					items: [
						'principles/design-values',
						'principles/browser-support',
					],
				},
				{
					label: '3. 共通ルール',
					items: [
						'common/naming',
						'common/directory-structure',
						'common/comments-and-docs',
						'common/format-and-lint',
						'common/accessibility',
						'common/images',
						'common/performance',
					],
				},
				{
					label: '4. 技術別ルール',
					items: ['tech/html', 'tech/css', 'tech/typescript', 'tech/react'],
				},
				{
					label: '5. 品質と運用',
					items: [
						'quality/testing',
						'quality/verification',
						'quality/git',
						'quality/review-checklist',
					],
				},
				{
					label: '6. AIとの協働',
					items: ['ai/agent-instructions'],
				},
			],
		}),
	],
});
