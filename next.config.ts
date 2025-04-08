import path from 'path'
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
}

export default nextConfig
