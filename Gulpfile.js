var elixir = require('laravel-elixir');

require('laravel-elixir-livereload');

elixir(function(mix) {
    mix
        .copy('node_modules/photon/fonts', 'public/fonts')
        .copy('resources/views', 'public/views')
        .copy('resources/assets/img', 'public/img')
        .browserify('app.js')
        .sass('app.scss')
    ;

    mix.livereload([
        'public/img/**/*',
        'public/js/**/*.js',
        'public/css/**/*.css',
        'public/views/**/*'
    ]);
});
