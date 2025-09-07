import path from 'path'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['antd'],
	},
	webpack(config) {
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
		domains: ['api.lawyerplace.kulenkov-group.kz', 'api.zanger-app.kz'],
	},
}

export default withNextIntl(nextConfig)
