import path from 'path'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
	transpilePackages: ['antd'],
	experimental: {
		optimizePackageImports: [],
	},
	webpack(config, { isServer }) {
		// Ensure CSS modules are handled correctly
		config.optimization = {
			...config.optimization,
			moduleIds: 'deterministic',
		}

		const oneOfRules = config.module.rules.find((rule: any) => typeof rule.oneOf === 'object')

		if (oneOfRules && Array.isArray(oneOfRules.oneOf)) {
			oneOfRules.oneOf.forEach((rule: any) => {
				if (rule.use && Array.isArray(rule.use)) {
					rule.use.forEach((loader: any) => {
						if (typeof loader === 'object' && loader?.loader?.includes('sass-loader')) {
							loader.options = {
								...loader.options,
								additionalData: `
								@use "@/app/styles/vars.scss" as *;
							`,
								sassOptions: {
									includePaths: [path.join(__dirname, 'src')],
								},
							}
						}
					})
				}
			})
		}

		return config
	},

	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/storage/images/**',
			},
			{
				protocol: 'https',
				hostname: 'api.lawyerplace.kulenkov-group.kz',
			},
			{
				protocol: 'https',
				hostname: 'api.zanger-app.kz',
			},
		],
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		minimumCacheTTL: 60,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ['image/webp'],
		unoptimized: false,
	},

	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
		]
	},

	async rewrites() {
		return [
			{
				source: '/api/proxy/:path*',
				destination: 'http://localhost:8000/:path*',
			},
		]
	},
}

export default withNextIntl(nextConfig)
