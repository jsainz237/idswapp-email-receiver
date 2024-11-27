lambda:
	npm run build
	cd dist && zip lambda.zip index.js