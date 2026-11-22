// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from 'starlight-theme-rapide';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages（https://ogitet.github.io/coding-guidelines/）で公開する
	site: 'https://ogitet.github.io',
	base: '/coding-guidelines',
	integrations: [
		starlight({
			title: 'Coding Guidelines',
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
			plugins: [starlightThemeRapide()],
			sidebar: [
				{
					label: '1. はじめに',
					items: [
						'about/purpose-and-scope',
						'about/compliance',
						'about/principles',
						'about/environment',
						'about/changelog',
					],
				},
				{
					label: '2. 共通ルール',
					items: [
						'common/naming',
						'common/comments',
						'common/format-and-lint',
						'common/images',
					],
				},
				{
					label: '3. 技術別ルール',
					items: ['tech/html', 'tech/css', 'tech/typescript', 'tech/react'],
				},
				{
					label: '4. 品質',
					items: [
						'quality/accessibility',
						'quality/performance',
						'quality/testing',
						'quality/verification',
					],
				},
				{
					label: '5. 開発フロー',
					items: ['workflow/git', 'workflow/review'],
				},
			],
		}),
	],
});
