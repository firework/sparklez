var elixir = require('laravel-elixir');
require('laravel-elixir-livereload');

elixir(function(mix) {
    mix
        .copy('node_modules/photon/fonts', 'public/fonts')
        .copy('resources/views', 'public/views')
        .copy('resources/assets/js', 'public/js')
        .sass('app.scss')
    ;

    mix.livereload([
        'public/js/**/*.js',
        'public/css/**/*.css',
        'public/views/**/*'
    ]);
});
