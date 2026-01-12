import path from 'path'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
    transpilePackages: ['antd', 'rc-upload'],
    
    // Явно указываем корень проекта чтобы избежать проблем с множественными lockfiles
    outputFileTracingRoot: path.join(__dirname),

    experimental: {},

	webpack(config, { isServer }) {
		// фиксация moduleIds для стабильности билдов
		config.optimization = {
			...config.optimization,
			moduleIds: 'deterministic',
		}

		// автоматическое подключение vars.scss ко всем scss-файлам
		const oneOfRules = config.module.rules.find(
			(rule: any) => typeof rule.oneOf === 'object'
		)

		if (oneOfRules && Array.isArray(oneOfRules.oneOf)) {
			oneOfRules.oneOf.forEach((rule: any) => {
				if (rule.use && Array.isArray(rule.use)) {
					rule.use.forEach((loader: any) => {
						if (
							typeof loader === 'object' &&
							loader?.loader?.includes('sass-loader')
						) {
                            loader.options = {
                                ...loader.options,
                                additionalData: `
                                    @use "@/app/styles/vars.scss" as *;
                                `,
                                sassOptions: {
                                    includePaths: [path.join(__dirname, 'src')],
                                    silenceDeprecations: ['legacy-js-api'],
                                    quietDeps: true,
                                },
                            }
						}
					})
				}
			})
		}

		return config
	},

	// ---- IMAGES ----
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'api.lawyerplace.kulenkov-group.kz',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'api.zanger-app.kz',
				pathname: '/**',
			},
		],
		unoptimized: true,
  		dangerouslyAllowSVG: true,

		// правильная CSP, НЕ блокирующая Google Analytics
		contentSecurityPolicy:
			"default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
			"connect-src 'self' https://www.google-analytics.com; " +
			"img-src 'self' data: https://www.google-analytics.com; " +
			"style-src 'self' 'unsafe-inline'; " +
			"frame-ancestors 'none';",

		minimumCacheTTL: 60,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ['image/webp'],
	},

	// ---- SECURITY HEADERS ----
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						// удалили nosniff — он ломал Google Analytics
						key: 'X-Content-Type-Options',
						value: '',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
		]
	},

	// ---- API PROXY ----
	async rewrites() {
		return [
			{
				source: '/api/proxy/:path*',
				destination: 'https://api.zanger-app.kz/api/:path*',
			},
		]
	},
}

export default withNextIntl(nextConfig)
