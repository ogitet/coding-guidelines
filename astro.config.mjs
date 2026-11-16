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
					label: '1. はじめに',
					items: [
						'introduction/purpose-and-scope',
						'introduction/compliance-levels',
						'introduction/changelog',
					],
				},
				{
					label: '2. 基本方針',
					items: [
						'principles/design-values',
						'principles/browser-support',
						'principles/tech-stack',
					],
				},
				{
					label: '3. 共通ルール',
					items: [
						'common/naming',
						'common/directory-structure',
						'common/comments-and-docs',
						'common/format-and-lint',
					],
				},
				{
					label: '4. 言語別ルール',
					items: ['languages/html', 'languages/css', 'languages/typescript'],
				},
				{
					label: '5. React',
					items: [
						'react/component-design',
						'react/hooks',
						'react/state-and-data-fetching',
						'react/performance',
					],
				},
				{
					label: '6. 品質と運用',
					items: [
						'quality/testing',
						'quality/git',
						'quality/security',
						'quality/review-checklist',
					],
				},
				{
					label: '7. AIとの協働',
					items: ['ai/instructing-claude', 'ai/reviewing-ai-code'],
				},
			],
		}),
	],
});
