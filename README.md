#Static page generator with internationalization

This is a static page generator I once created for freelance work. It generates pages in multiple languages based on a Google spreadsheet file.
The generator works by downloading the contents of the [spreadsheet file that contains a key column and multiple translation columns](https://docs.google.com/spreadsheets/d/1gA-5lpURCmllQAuTkc5vDvAv6Y4eXJDyr8XS-QJntes/edit?usp=sharing).

![gif](http://g.recordit.co/eOspjX8z5S.gif)

##Using the template

###0. Clone the repo

```
git clone https://github.com/jestersimpps/static-generator-for-front-end-devs.git
rm -rf static-generator-for-front-end-devs/.git
```
###1. Install dependencies

Install all development dependencies and client side libraries:

```
npm install
bower install
```

###2. Set up Google Spreadsheet file

A detailed guide can be found [on my blog](http://jestersimpps.github.io/experimenting-with-google-spreadsheets-assemble-io-and-internationalisation/).

###3. Add your data to the `Gruntfile.js` config file

```
config: {
	project_name       	: '',
	src                	: 'src',
	dist               	: 'dist',
	locales            	: 'locales',
	google_document_key	: '1gA-5lpURCmllQAuTkc5vDvAv6Y4eXJDyr8XS-QJntes',
	default_locale     	: 'en',
	language_column1    : 'en',
	language_column2    : 'fr',
	language_column3    : 'es',
	AWSbucket          	: '',
	AWSregion          	: 'eu-west-1',
	AWSAccessKeyId     	: '',
	AWSSecretKey       	: ''
},
```

###4. Development

Development is done in handlebars templates. They are assembled using [Assemble.io](http://assemble.io).

Development with automatic page reload:
```
grunt serve
```

###5. Build for production


```
grunt Build
```

The generator features automatic uploads to Amazon s3 on build.
To disable these, comment out the aws_s3 in the build task at the bottom of the `Gruntfile.js`:

```
grunt.registerTask('build', [
	'clean',
	'bower_concat',
	'copy:files',
	'copy:fonts',
	'imagemin',
	'sass',
	'concat:css',
	'cssmin',
	'concat:js',
	'assemble',
	'htmlmin',
	'uglify',
	'getlanguages',
	'i18n',
	'clean:tmp',
	// 'aws_s3'
]);
```
