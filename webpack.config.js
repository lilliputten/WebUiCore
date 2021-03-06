/** @desc Webpack configuration
 *  @since 2020.05.18, 12:00
 *  @changed 2021.05.12, 14:05
 */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // https://www.npmjs.com/package/webpack-build-notifier
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CreateFileWebpack = require('create-file-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// // const UglifyJS = require('uglify-js')
// // const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const WebpackFilePreprocessorPlugin = require('webpack-file-preprocessor-plugin');
const ExtractCssPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {

  const mode = argv.mode || 'production';
  const isDev = (/* isDevServer || */ mode === 'development');
  const isProd = !isDev; // mode === 'production'
  const isCosmos = (process.env.npm_lifecycle_event === 'cosmos'); // Runs under react-cosmos?
  const isDevServer = isCosmos || (isDev && !!argv.hot); // (mode === 'none'); // (none = server) // Alternate method: !!argv.host;
  // const isDevServer = isCosmos || !!argv.host; // OLD method; Doesnt works on Webpack 5
  const hotReload = isDevServer;
  const cssHotReload = hotReload; // Hot reload css for dev-server
  const isStats = !!argv.profile;
  const isWatch = !!argv.watch;
  const useDevTool = true && isDev; // Need server restart
  const minimizeBundles = true && isProd; // To minimize production bundles
  // const preprocessBundles = false && isProd; // To minimize production bundles
  const sourceMaps = true && isDev; // !preprocessBundles // To minimize production bundles
  // const extemeUglify = false // Use mangling (WARNING: May broke some code! Don't use without testing!)
  const DEBUG = true && (isDev || isDevServer);
  const rootPath = path.resolve(__dirname);
  const srcPath = path.resolve(__dirname, 'src');
  // const debugDataPath = path.resolve(__dirname, 'debug-data') // Debug-time data stubs
  const mixinsPath = path.resolve(srcPath, '!mixins');

  // Additional configuration params from `webpack.env.js`, `webpack.env.local.js` and `webpack.env.debug.js`
  const webpackEnvFile = './webpack.env.js';
  const webpackEnvLocalFile = './webpack.env.local.js';
  const webpackEnvDebugFile = './webpack.env.debug.js';
  const webpackEnv = fs.existsSync(webpackEnvFile) && require(webpackEnvFile);
  // Extend webpack config with local & debug (only for dev-server!) settings
  const webpackEnvLocal = fs.existsSync(webpackEnvLocalFile) && require(webpackEnvLocalFile);
  const webpackEnvDebug = isDevServer && fs.existsSync(webpackEnvDebugFile) && require(webpackEnvDebugFile);
  // Merge parameters from config files and command line (eg `--env.DEMO=true`)
  // Ovverride sequence: env, env.local, env.debug, command line paraeters.
  env = Object.assign({}, webpackEnv, webpackEnvLocal, webpackEnvDebug, env);

  const THEME = env.THEME || 'default';
  const THEME_FILE = './themes/' + THEME; // For including in `src/config/css.js`
  // Set process.env variables for using in included below `css` module.
  // Also see passing variables to source code below.
  process.env.THEME = THEME;
  process.env.THEME_FILE = THEME_FILE;

  const isBuild = !!env.DIST;
  const isDemo = !isBuild;

  // Project configuration
  const packageFile = path.resolve(rootPath, 'package');
  const pkgConfig = require(packageFile);

  // Project version, application title
  const {
    // name: projectName,
    // title: projectTitle,
    version,
    timestamp,
    timetag,
  } = pkgConfig;

  // TODO: Load version, timestamp, timetag from generated files

  /* // UNUSED: Generate time stamps... (UNUSED: see `util-update-build-time.*` scripts)
   * const dateStringFormat = 'yyyy.mm.dd HH:MM:ss'
   * const dateTagFormat = 'yymmdd-HHMM'
   * const now = new Date()
   * const dateformat = require('dateformat') // NOTE: Useing pre-generated timestamps from `package.json`
   * const timestamp = dateformat(now, dateStringFormat)
   * const timetag = dateformat(now, dateTagFormat)
   * const buildTagFile = 'build-timetag.txt'
   * const buildTag = fs.existsSync(buildTagFile) && fs.readFileSync(buildTagFile, 'utf8') || timetag
   */

  const CopyWebpackPluginOptions = {
    globOptions: {
      ignore: [
        // Temp files
        '**/*.tmp',
        '**/*.bak',
        '**/*.sw?',
        // Misc backup files
        '**/*_',
        '**/*~',
        '**/*UNUSED',
        // Auxilary files
        '**/*.diff',
        '**/*.orig',
      ],
    },
  };

  // Only for demo mode
  const htmlFilename = 'index.html';

  // Build profile params...
  const buildType = isDevServer ? 'server' : isBuild ? 'build' : 'demo';
  const buildMode = isProd ? 'prod' : 'dev';
  const buildModePostfix = ''; // isDev ? '-dev' : '';
  const buildFolder = buildType + buildModePostfix;
  const buildPath = path.resolve(rootPath, buildFolder);

  const buildTag = [ // Construct general-purpose build tag
    'v.' + version,
    timetag,
    buildType,
    buildMode,
    THEME,
  ].join('-');

  // NOTE: Dynamically created dist library name from project name
  const buildLibName = pkgConfig.name + 'Dist'; // 'WebUiCoreDist'

  const useHashes = false; // NOTE: Not works with pseudo-dynamic bundles loading method (with hardcoded urls)
  const bundleName = ({ ext, name, dir } = {}) => (dir || 'js/') + (name || '[name]') + (useHashes && !isWatch && !isDevServer ? '-[contenthash:8]' : '') + (ext || '.js');

  const mirrorStaticFolders = false; // NOTE: Mirror static folders structure (eg: `.../bootstrap/distr/...`)
  const staticFolderUrl = 'assets'; // Relative to css folder

  const fileLoaderOptions = {
    // limit: 1, // Extract all resources
    // // Simple name (plain folder)
    // // name: (isDevServer || isDevServer) ? '[path][name].[ext]' : staticFolderUrl + '/[name]-[contenthash:8].[ext]',
    // name: (isDevServer || isDevServer) ? '[path][name].[ext]' : staticFolderUrl + '/[name]-[hash:8].[ext]',
    // Mirroring static files folders
    // publicPath: '../', // Root relative from 'css' folder
    name: (file) => {
      let name = file;
      if (isDevServer /* || isDev */) {
        name = '[path][name].[ext]';
      }
      else if (mirrorStaticFolders) {
        if (name.startsWith(rootPath)) {
          name = name.substr(rootPath.length);
        }
        name = staticFolderUrl + name
          .replace(/\\/g, '/')
          // .replace(/^\//, '')
          .replace(/^\/node_modules/, '')
          .replace(/([^/]+)$/, '[name]-[hash:8].[ext]');
        // .replace(/([^/]+)$/, '[name].[ext]')
      }
      else {
        name = staticFolderUrl + '/[name]-[hash:8].[ext]';
      }
      return name;
    },
  };

  /* const preprocessJs = (src) => {
   *   // Preprocess DEBUG/DEBUG-BEGIN...DEBUG-END/NO-DEBUG statements
   *   src = src
   *     .replace(/(\/\*\s*DEBUG-BEGIN.*?)(\*\/[\s\S]*?\/\*)(.*?DEBUG-END\s*\*\/)/gm, (_match, begin, body, end) => {
   *       body = body
   *         .replace(/\/\<]g, '[>')
   *         .replace(/\*\//g, '<]');
   *       return begin + body + end;
   *     })
   *     .replace(/\/\*\s*DEBUG\b(|[^-].*?)\*\//gm, '//DEBUG$1//') // [>DEBUG...<]
   *     .replace(/(\/\*\s*NO-?DEBUG)(\s+)([\s\S]*?)(\s*\*\/)/gm, '$1$4$2$3'); // TODO: Babelify code?
   *   return src;
   * };
   */

  const demoModule = // 'AsyncModal' ||
    env.DEMO_MODULE || 'demo';

  const jsEntryExt = '.jsx';
  // const jsEntryExt = '.tsx';
  const jsEntryFile = (isBuild ? 'build' : demoModule) + jsEntryExt; // js source

  const bundleFile = 'bundle.js';

  // Create build package file contents
  const getBuildPackageConfig = () => {
    const buildPkg = { ...pkgConfig };
    delete buildPkg.unusedDependencies;
    delete buildPkg.unusedDependencies;
    delete buildPkg.devDependencies;
    // NOTE: Preserving `peerDependencies`???
    // TDDO 2020.07.20, 15:56 -- Use `bundleDependencies` instead `dependencies`.
    delete buildPkg.scripts;
    buildPkg.main = bundleFile;
    buildPkg.name = buildLibName;
    return buildPkg;
  };

  const libOutput = isBuild ? { // Additional webpack output for library mode
    // library: projectName, // Causes extra libarary folding level (`WebUiCore.WebUiCore.*`)
    libraryTarget: 'commonjs2',
    filename: bundleFile,
    auxiliaryComment: 'Test Comment', // ???
  } : {};

  // Common used style variables
  const cssConfigFile = path.resolve(srcPath, 'config', 'css.js');
  const cssConfig = fs.existsSync(cssConfigFile) ? require(cssConfigFile) : {};

  const postcssPlugins = [
    require('postcss-flexbugs-fixes'),
    require('postcss-import'),
    require('postcss-mixins')({ // https://github.com/postcss/postcss-mixins
      mixinsDir: [
        mixinsPath,
      ],
    }),
    require('postcss-advanced-variables')({ // https://github.com/jonathantneal/postcss-advanced-variables
      // unresolved: 'warn', // 'ignore',
      variables: cssConfig,
    }),
    require('postcss-simple-vars'), // https://github.com/postcss/postcss-simple-vars
    require('postcss-conditionals'), // https://github.com/andyjansson/postcss-conditionals
    require('postcss-color-function'), // https://github.com/postcss/postcss-color-function
    require('postcss-calc')({ mediaQueries: true, selectors: true }), // https://github.com/postcss/postcss-calc
    require('postcss-nested-ancestors'), // https://github.com/toomuchdesign/postcss-nested-ancestors
    require('postcss-nested'),
    require('postcss-each'),
    require('postcss-url')({
      url: 'rebase',
      // maxSize: 20,
      // url: 'rebase',
    }),
    require('postcss-flexbugs-fixes'),
    require('autoprefixer')({
      flexbox: 'no-2009',
    }),
    minimizeBundles && require('postcss-csso'),
    require('postcss-reporter'),
  ].filter(Boolean);

  const passParameters = { // Pass parameters to code (to js & pcss)
    rootPath,
    bodyBgColor: cssConfig.bodyBgColor,
    THEME,
    THEME_FILE,
    DEBUG,
    DEV_DEBUG: DEBUG && env.DEV_DEBUG, // Extra debug level (on developers' machine, usually from `webpack.env.local.js` or specific npm script command)
    // DEV_SERVER: DEBUG && env.DEV_SERVER, // Debug server
    isBuild,
    isDemo,
    isDevServer,
    isDev,
    isProd,
    isWatch,
    buildTag,
    timetag,
    timestamp,
    version,
  };

  // Stats waiting only json on output...
  const debugModes = [
    buildTag,
    'mode:' + mode,
    // mode,
    // 'ip:' + myIP,
    isBuild && 'Dist',
    isDemo && 'Demo',
    isDemo && demoModule && ('demoModule:' + demoModule),
    isCosmos && 'Cosmos',
    isDevServer && 'DevServer',
    isWatch && 'Watch',
    isDev && 'Development',
    isProd && 'Production',
    useDevTool && 'DevTool',
    minimizeBundles && 'minimize',
    // preprocessBundles && 'preprocess',
    sourceMaps && 'sourceMaps',
    // extemeUglify && 'extemeUglify',
    DEBUG && 'DEBUG',
    THEME && 'theme:' + THEME,
  ].filter(Boolean).join(' ');
  if (!isStats) {
    console.log('Building:', debugModes); // eslint-disable-line no-console
  }

  // Load external modules list from `package.json` `dependencies` entry?
  const externalModules = isBuild && Object.keys(pkgConfig.dependencies);

  return {
    devtool: 'source-map',
    entry: path.resolve(srcPath, jsEntryFile),
    target: isDevServer ? 'web' : ['web', 'es5'], // 2021.04.12, 14:42 -- Fix-up for webpack 5 hot-reload / es5 transpilling.
    // target: 'web', // 2021.04.12, 14:42 -- Fix-up for webpack 5 hot-reload feature.
    // target: ['web', 'es5'], // 2021.04.13, 15:47 -- Fix-up for es5 transpilling?
    performance: { hints: false },
    watch: isWatch,
    watchOptions: {
      ignored: [
        'node_modules/**',
        'src/**/.*.sw?',
        'src/**/*.bak',
        'src/**/*_',
        'src/**/*~',
        'src/**/*UNUSED',
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        demo: path.join(srcPath, 'demo'),
        config: path.join(srcPath, 'config'),
        elements: path.join(srcPath, 'elements'),
        forms: path.join(srcPath, 'forms'),
        utils: path.join(srcPath, 'utils'),
        helpers: path.join(srcPath, 'helpers'),
      },
    },
    output: {
      path: buildPath,
      filename: bundleName(), // 'js/bundle.js',
      ...libOutput
    },
    externals: externalModules && externalModules.reduce((result, module) => {
      return { ...result, [module]: true };
    }, {}) || {},
    devServer: {
      hot: hotReload,
      index: htmlFilename,
      // contentBase: buildPath,
      // watchContentBase: true,
      port: 8080,
      host: '0.0.0.0',
    },
    module: { rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { // js
        test: /\.jsx?$/,
        // test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // sourceRoot: '/',
          inputSourceMap: true,
          sourceMaps: sourceMaps,
          retainLines: true,
          cacheDirectory: true,
        },
      },
      { // css/postcss
        test: /\.(pcss|css)$/,
        // exclude: /node_modules/, // Some imports may be from `node_modules/...`
        use: [
          cssHotReload ? 'style-loader' : ExtractCssPlugin.loader, // Hot styles realoading for dev-server
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: sourceMaps,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              postcssOptions: {
                ident: 'postcss',
                sourceMap: sourceMaps,
                parser: require('postcss-scss'),
                plugins: postcssPlugins,
                // plugins: () => postcssPlugins,
              },
            },
          },
        ],
      },
      { // resources
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        // Using `url-loader` for library but `file-loader` for demo-server
        // due to incorrect webpack `publicPath` resolving for library.
        // See [How to ship assets?](https://github.com/webpack/webpack/issues/7353)
        // TODO: M.b. here exists the solution for store library assets outside js code?
        loader: isDevServer ? require.resolve('file-loader') : require.resolve('url-loader'), // External assets for dev-time, embedded for library build
        // loader: require.resolve('file-loader'), // Use external assed from files
        // loader: require.resolve('url-loader'), // Use css-injected assets
        options: fileLoaderOptions,
      },
    ] },
    plugins: [
      !isDevServer && !isStats && new CleanWebpackPlugin({ // Cleanup before build
        cleanOnceBeforeBuildPatterns: [
          path.join(buildPath, '**/*'),
        ],
        exclude: ['.gitkeep'],
        beforeEmit: true,
        // verbose: true,
        // dry: false,
      }),
      new webpack.DefinePlugin({ // Pass constants to source code
        'process.env': Object.entries(passParameters).reduce((data, [key, val]) => {
          return { ...data, [key]: JSON.stringify(val) };
        }, {})
      }),
      !isDevServer && new CopyWebpackPlugin({ // Simply copies the files over
        patterns: [
          { from: 'static-build-files', to: './', ...CopyWebpackPluginOptions },
          { from: 'favicon.ico', to: './', ...CopyWebpackPluginOptions },
          { from: 'CHANGELOG.md', to: './', ...CopyWebpackPluginOptions },
          { from: 'README.md', to: './', ...CopyWebpackPluginOptions }, // Readme listed at last position -- then can be overriden if readme exists in `static-build-files` (commands executiong in reversed order?).
        ].filter(Boolean),
      }),
      isDemo && new HtmlWebpackPlugin({
        template: path.resolve(rootPath, 'demo-html', htmlFilename),
        filename: htmlFilename,
        cache: true,
        inject: true,
        // minimify: minimizeBundles,
        minify: false,
        // title: appTitle, // Not using; see i18n-specific appTitle** variables above (passed to js code env)
        templateParameters: Object.assign({}, /* cssConfig, */ passParameters),
      }),
      !cssHotReload && new ExtractCssPlugin({ // Extract css
        filename: isBuild ? 'styles.css' : bundleName({ ext: '.css', dir: 'css/' }),
      }),
      /* isBuild && preprocessBundles && new WebpackFilePreprocessorPlugin({
       *   debug: !isStats, // Prints processed assets if set to true (default: false)
       *   pattern: /\.js$/,
       *   process: preprocessJs
       * }),
       */
      // new webpack.NoEmitOnErrorsPlugin(), // ???
      isBuild && new CreateFileWebpack({ // Create build tag file
        path: buildPath,
        fileName: 'version.txt',
        content: buildTag,
      }),
      isBuild && new CreateFileWebpack({ // Create build package.json file
        path: buildPath,
        fileName: 'package.json',
        content: JSON.stringify(getBuildPackageConfig(), null, 2),
      }),
      new WebpackBuildNotifierPlugin({
        // title, logo,
        suppressSuccess: true,
      }),
    ].filter(Boolean),
    optimization: {
      // Minimize if not preprocess and minimize flags configured
      minimize: /* preprocessBundles || */ minimizeBundles,
      minimizer: [
        new UglifyJsPlugin({
          test: /\.js$/i,
          // parallel: 8,
          sourceMap: sourceMaps,
          uglifyOptions: {
            output: {
              comments: false,
              ie8: true
            },
            // https://github.com/mishoo/UglifyJS2#compress-options
            compress: {
              // drop_debugger: false,
              // screw_ie8: true,
              // sequences: true,
              // booleans: true,
              // loops: true,
              // unused: true,
              // warnings: false,
              // drop_console: true,
              // unsafe: true
            },
            // beautify: false,
          },
        }),
        // new OptimizeCSSAssetsPlugin({
        //   cssProcessorPluginOptions: {
        //     sourceMap: sourceMaps,
        //     // preset: ['default', { discardComments: { removeAll: true } }],
        //   },
        // }),
      ],
    },
    stats: {
      // Nice colored output
      colors: true,
    },
  };

};
