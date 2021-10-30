{ fetchurl, fetchgit, linkFarm, runCommand, gnutar }: rec {
  offline_cache = linkFarm "offline" packages;
  packages = [
    {
      name = "_cspotcode_source_map_consumer___source_map_consumer_0.8.0.tgz";
      path = fetchurl {
        name = "_cspotcode_source_map_consumer___source_map_consumer_0.8.0.tgz";
        url  = "https://registry.yarnpkg.com/@cspotcode/source-map-consumer/-/source-map-consumer-0.8.0.tgz";
        sha1 = "33bf4b7b39c178821606f669bbc447a6a629786b";
      };
    }
    {
      name = "_cspotcode_source_map_support___source_map_support_0.6.1.tgz";
      path = fetchurl {
        name = "_cspotcode_source_map_support___source_map_support_0.6.1.tgz";
        url  = "https://registry.yarnpkg.com/@cspotcode/source-map-support/-/source-map-support-0.6.1.tgz";
        sha1 = "118511f316e2e87ee4294761868e254d3da47960";
      };
    }
    {
      name = "_discordjs_builders___builders_0.5.0.tgz";
      path = fetchurl {
        name = "_discordjs_builders___builders_0.5.0.tgz";
        url  = "https://registry.yarnpkg.com/@discordjs/builders/-/builders-0.5.0.tgz";
        sha1 = "646cbea9cc67f68639e6fb70ed1278b26dacdb14";
      };
    }
    {
      name = "_discordjs_collection___collection_0.2.1.tgz";
      path = fetchurl {
        name = "_discordjs_collection___collection_0.2.1.tgz";
        url  = "https://registry.yarnpkg.com/@discordjs/collection/-/collection-0.2.1.tgz";
        sha1 = "ea4bc7b41b7b7b6daa82e439141222ec95c469b2";
      };
    }
    {
      name = "_discordjs_form_data___form_data_3.0.1.tgz";
      path = fetchurl {
        name = "_discordjs_form_data___form_data_3.0.1.tgz";
        url  = "https://registry.yarnpkg.com/@discordjs/form-data/-/form-data-3.0.1.tgz";
        sha1 = "5c9e6be992e2e57d0dfa0e39979a850225fb4697";
      };
    }
    {
      name = "_sapphire_async_queue___async_queue_1.1.4.tgz";
      path = fetchurl {
        name = "_sapphire_async_queue___async_queue_1.1.4.tgz";
        url  = "https://registry.yarnpkg.com/@sapphire/async-queue/-/async-queue-1.1.4.tgz";
        sha1 = "ae431310917a8880961cebe8e59df6ffa40f2957";
      };
    }
    {
      name = "_sindresorhus_is___is_4.0.1.tgz";
      path = fetchurl {
        name = "_sindresorhus_is___is_4.0.1.tgz";
        url  = "https://registry.yarnpkg.com/@sindresorhus/is/-/is-4.0.1.tgz";
        sha1 = "d26729db850fa327b7cacc5522252194404226f5";
      };
    }
    {
      name = "_tsconfig_node10___node10_1.0.8.tgz";
      path = fetchurl {
        name = "_tsconfig_node10___node10_1.0.8.tgz";
        url  = "https://registry.yarnpkg.com/@tsconfig/node10/-/node10-1.0.8.tgz";
        sha1 = "c1e4e80d6f964fbecb3359c43bd48b40f7cadad9";
      };
    }
    {
      name = "_tsconfig_node12___node12_1.0.9.tgz";
      path = fetchurl {
        name = "_tsconfig_node12___node12_1.0.9.tgz";
        url  = "https://registry.yarnpkg.com/@tsconfig/node12/-/node12-1.0.9.tgz";
        sha1 = "62c1f6dee2ebd9aead80dc3afa56810e58e1a04c";
      };
    }
    {
      name = "_tsconfig_node14___node14_1.0.1.tgz";
      path = fetchurl {
        name = "_tsconfig_node14___node14_1.0.1.tgz";
        url  = "https://registry.yarnpkg.com/@tsconfig/node14/-/node14-1.0.1.tgz";
        sha1 = "95f2d167ffb9b8d2068b0b235302fafd4df711f2";
      };
    }
    {
      name = "_tsconfig_node16___node16_1.0.2.tgz";
      path = fetchurl {
        name = "_tsconfig_node16___node16_1.0.2.tgz";
        url  = "https://registry.yarnpkg.com/@tsconfig/node16/-/node16-1.0.2.tgz";
        sha1 = "423c77877d0569db20e1fc80885ac4118314010e";
      };
    }
    {
      name = "_types_dotenv_safe___dotenv_safe_8.1.2.tgz";
      path = fetchurl {
        name = "_types_dotenv_safe___dotenv_safe_8.1.2.tgz";
        url  = "https://registry.yarnpkg.com/@types/dotenv-safe/-/dotenv-safe-8.1.2.tgz";
        sha1 = "72f126969f445af5654efd3167deabc2cbc6c24e";
      };
    }
    {
      name = "_types_node_fetch___node_fetch_2.5.12.tgz";
      path = fetchurl {
        name = "_types_node_fetch___node_fetch_2.5.12.tgz";
        url  = "https://registry.yarnpkg.com/@types/node-fetch/-/node-fetch-2.5.12.tgz";
        sha1 = "8a6f779b1d4e60b7a57fb6fd48d84fb545b9cc66";
      };
    }
    {
      name = "_types_node___node_16.6.1.tgz";
      path = fetchurl {
        name = "_types_node___node_16.6.1.tgz";
        url  = "https://registry.yarnpkg.com/@types/node/-/node-16.6.1.tgz";
        sha1 = "aee62c7b966f55fc66c7b6dfa1d58db2a616da61";
      };
    }
    {
      name = "_types_ws___ws_7.4.7.tgz";
      path = fetchurl {
        name = "_types_ws___ws_7.4.7.tgz";
        url  = "https://registry.yarnpkg.com/@types/ws/-/ws-7.4.7.tgz";
        sha1 = "f7c390a36f7a0679aa69de2d501319f4f8d9b702";
      };
    }
    {
      name = "acorn_walk___acorn_walk_8.1.1.tgz";
      path = fetchurl {
        name = "acorn_walk___acorn_walk_8.1.1.tgz";
        url  = "https://registry.yarnpkg.com/acorn-walk/-/acorn-walk-8.1.1.tgz";
        sha1 = "3ddab7f84e4a7e2313f6c414c5b7dac85f4e3ebc";
      };
    }
    {
      name = "acorn___acorn_8.4.1.tgz";
      path = fetchurl {
        name = "acorn___acorn_8.4.1.tgz";
        url  = "https://registry.yarnpkg.com/acorn/-/acorn-8.4.1.tgz";
        sha1 = "56c36251fc7cabc7096adc18f05afe814321a28c";
      };
    }
    {
      name = "anymatch___anymatch_3.1.2.tgz";
      path = fetchurl {
        name = "anymatch___anymatch_3.1.2.tgz";
        url  = "https://registry.yarnpkg.com/anymatch/-/anymatch-3.1.2.tgz";
        sha1 = "c0557c096af32f106198f4f4e2a383537e378716";
      };
    }
    {
      name = "arg___arg_4.1.3.tgz";
      path = fetchurl {
        name = "arg___arg_4.1.3.tgz";
        url  = "https://registry.yarnpkg.com/arg/-/arg-4.1.3.tgz";
        sha1 = "269fc7ad5b8e42cb63c896d5666017261c144089";
      };
    }
    {
      name = "asynckit___asynckit_0.4.0.tgz";
      path = fetchurl {
        name = "asynckit___asynckit_0.4.0.tgz";
        url  = "https://registry.yarnpkg.com/asynckit/-/asynckit-0.4.0.tgz";
        sha1 = "c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79";
      };
    }
    {
      name = "binary_extensions___binary_extensions_2.2.0.tgz";
      path = fetchurl {
        name = "binary_extensions___binary_extensions_2.2.0.tgz";
        url  = "https://registry.yarnpkg.com/binary-extensions/-/binary-extensions-2.2.0.tgz";
        sha1 = "75f502eeaf9ffde42fc98829645be4ea76bd9e2d";
      };
    }
    {
      name = "braces___braces_3.0.2.tgz";
      path = fetchurl {
        name = "braces___braces_3.0.2.tgz";
        url  = "https://registry.yarnpkg.com/braces/-/braces-3.0.2.tgz";
        sha1 = "3454e1a462ee8d599e236df336cd9ea4f8afe107";
      };
    }
    {
      name = "callsites___callsites_3.1.0.tgz";
      path = fetchurl {
        name = "callsites___callsites_3.1.0.tgz";
        url  = "https://registry.yarnpkg.com/callsites/-/callsites-3.1.0.tgz";
        sha1 = "b3630abd8943432f54b3f0519238e33cd7df2f73";
      };
    }
    {
      name = "chokidar___chokidar_3.5.2.tgz";
      path = fetchurl {
        name = "chokidar___chokidar_3.5.2.tgz";
        url  = "https://registry.yarnpkg.com/chokidar/-/chokidar-3.5.2.tgz";
        sha1 = "dba3976fcadb016f66fd365021d91600d01c1e75";
      };
    }
    {
      name = "colors___colors_1.4.0.tgz";
      path = fetchurl {
        name = "colors___colors_1.4.0.tgz";
        url  = "https://registry.yarnpkg.com/colors/-/colors-1.4.0.tgz";
        sha1 = "c50491479d4c1bdaed2c9ced32cf7c7dc2360f78";
      };
    }
    {
      name = "combined_stream___combined_stream_1.0.8.tgz";
      path = fetchurl {
        name = "combined_stream___combined_stream_1.0.8.tgz";
        url  = "https://registry.yarnpkg.com/combined-stream/-/combined-stream-1.0.8.tgz";
        sha1 = "c3d45a8b34fd730631a110a8a2520682b31d5a7f";
      };
    }
    {
      name = "cookiecord___cookiecord_0.8.18.tgz";
      path = fetchurl {
        name = "cookiecord___cookiecord_0.8.18.tgz";
        url  = "https://registry.yarnpkg.com/cookiecord/-/cookiecord-0.8.18.tgz";
        sha1 = "82b42b752095c4e62f43f08624b7782602f0a9ea";
      };
    }
    {
      name = "create_require___create_require_1.1.1.tgz";
      path = fetchurl {
        name = "create_require___create_require_1.1.1.tgz";
        url  = "https://registry.yarnpkg.com/create-require/-/create-require-1.1.1.tgz";
        sha1 = "c1d7e8f1e5f6cfc9ff65f9cd352d37348756c333";
      };
    }
    {
      name = "dateformat___dateformat_4.5.1.tgz";
      path = fetchurl {
        name = "dateformat___dateformat_4.5.1.tgz";
        url  = "https://registry.yarnpkg.com/dateformat/-/dateformat-4.5.1.tgz";
        sha1 = "c20e7a9ca77d147906b6dc2261a8be0a5bd2173c";
      };
    }
    {
      name = "delayed_stream___delayed_stream_1.0.0.tgz";
      path = fetchurl {
        name = "delayed_stream___delayed_stream_1.0.0.tgz";
        url  = "https://registry.yarnpkg.com/delayed-stream/-/delayed-stream-1.0.0.tgz";
        sha1 = "df3ae199acadfb7d440aaae0b29e2272b24ec619";
      };
    }
    {
      name = "diff___diff_4.0.2.tgz";
      path = fetchurl {
        name = "diff___diff_4.0.2.tgz";
        url  = "https://registry.yarnpkg.com/diff/-/diff-4.0.2.tgz";
        sha1 = "60f3aecb89d5fae520c11aa19efc2bb982aade7d";
      };
    }
    {
      name = "discord_api_types___discord_api_types_0.22.0.tgz";
      path = fetchurl {
        name = "discord_api_types___discord_api_types_0.22.0.tgz";
        url  = "https://registry.yarnpkg.com/discord-api-types/-/discord-api-types-0.22.0.tgz";
        sha1 = "34dc57fe8e016e5eaac5e393646cd42a7e1ccc2a";
      };
    }
    {
      name = "d0bc4d7ff037035d4f315a0286b06f0a1ade29c1";
      path = fetchurl {
        name = "d0bc4d7ff037035d4f315a0286b06f0a1ade29c1";
        url  = "https://codeload.github.com/discordjs/discord.js/tar.gz/d0bc4d7ff037035d4f315a0286b06f0a1ade29c1";
        sha1 = "233fc63539580ade93d1e7b64d49054cc225f7da";
      };
    }
    {
      name = "dot_prop___dot_prop_6.0.1.tgz";
      path = fetchurl {
        name = "dot_prop___dot_prop_6.0.1.tgz";
        url  = "https://registry.yarnpkg.com/dot-prop/-/dot-prop-6.0.1.tgz";
        sha1 = "fc26b3cf142b9e59b74dbd39ed66ce620c681083";
      };
    }
    {
      name = "dotenv_safe___dotenv_safe_8.2.0.tgz";
      path = fetchurl {
        name = "dotenv_safe___dotenv_safe_8.2.0.tgz";
        url  = "https://registry.yarnpkg.com/dotenv-safe/-/dotenv-safe-8.2.0.tgz";
        sha1 = "8d548c7318a62c09a66c4dc8c31864cc007c78ba";
      };
    }
    {
      name = "dotenv___dotenv_8.6.0.tgz";
      path = fetchurl {
        name = "dotenv___dotenv_8.6.0.tgz";
        url  = "https://registry.yarnpkg.com/dotenv/-/dotenv-8.6.0.tgz";
        sha1 = "061af664d19f7f4d8fc6e4ff9b584ce237adcb8b";
      };
    }
    {
      name = "fill_range___fill_range_7.0.1.tgz";
      path = fetchurl {
        name = "fill_range___fill_range_7.0.1.tgz";
        url  = "https://registry.yarnpkg.com/fill-range/-/fill-range-7.0.1.tgz";
        sha1 = "1919a6a7c75fe38b2c7c77e5198535da9acdda40";
      };
    }
    {
      name = "form_data___form_data_3.0.1.tgz";
      path = fetchurl {
        name = "form_data___form_data_3.0.1.tgz";
        url  = "https://registry.yarnpkg.com/form-data/-/form-data-3.0.1.tgz";
        sha1 = "ebd53791b78356a99af9a300d4282c4d5eb9755f";
      };
    }
    {
      name = "fsevents___fsevents_2.3.2.tgz";
      path = fetchurl {
        name = "fsevents___fsevents_2.3.2.tgz";
        url  = "https://registry.yarnpkg.com/fsevents/-/fsevents-2.3.2.tgz";
        sha1 = "8a526f78b8fdf4623b709e0b975c52c24c02fd1a";
      };
    }
    {
      name = "glob_parent___glob_parent_5.1.2.tgz";
      path = fetchurl {
        name = "glob_parent___glob_parent_5.1.2.tgz";
        url  = "https://registry.yarnpkg.com/glob-parent/-/glob-parent-5.1.2.tgz";
        sha1 = "869832c58034fe68a4093c17dc15e8340d8401c4";
      };
    }
    {
      name = "humanize_duration___humanize_duration_3.27.0.tgz";
      path = fetchurl {
        name = "humanize_duration___humanize_duration_3.27.0.tgz";
        url  = "https://registry.yarnpkg.com/humanize-duration/-/humanize-duration-3.27.0.tgz";
        sha1 = "3f781b7cf8022ad587f76b9839b60bc2b29636b2";
      };
    }
    {
      name = "is_binary_path___is_binary_path_2.1.0.tgz";
      path = fetchurl {
        name = "is_binary_path___is_binary_path_2.1.0.tgz";
        url  = "https://registry.yarnpkg.com/is-binary-path/-/is-binary-path-2.1.0.tgz";
        sha1 = "ea1f7f3b80f064236e83470f86c09c254fb45b09";
      };
    }
    {
      name = "is_extglob___is_extglob_2.1.1.tgz";
      path = fetchurl {
        name = "is_extglob___is_extglob_2.1.1.tgz";
        url  = "https://registry.yarnpkg.com/is-extglob/-/is-extglob-2.1.1.tgz";
        sha1 = "a88c02535791f02ed37c76a1b9ea9773c833f8c2";
      };
    }
    {
      name = "is_glob___is_glob_4.0.1.tgz";
      path = fetchurl {
        name = "is_glob___is_glob_4.0.1.tgz";
        url  = "https://registry.yarnpkg.com/is-glob/-/is-glob-4.0.1.tgz";
        sha1 = "7567dbe9f2f5e2467bc77ab83c4a29482407a5dc";
      };
    }
    {
      name = "is_number___is_number_7.0.0.tgz";
      path = fetchurl {
        name = "is_number___is_number_7.0.0.tgz";
        url  = "https://registry.yarnpkg.com/is-number/-/is-number-7.0.0.tgz";
        sha1 = "7535345b896734d5f80c4d06c50955527a14f12b";
      };
    }
    {
      name = "is_obj___is_obj_2.0.0.tgz";
      path = fetchurl {
        name = "is_obj___is_obj_2.0.0.tgz";
        url  = "https://registry.yarnpkg.com/is-obj/-/is-obj-2.0.0.tgz";
        sha1 = "473fb05d973705e3fd9620545018ca8e22ef4982";
      };
    }
    {
      name = "lodash.isequal___lodash.isequal_4.5.0.tgz";
      path = fetchurl {
        name = "lodash.isequal___lodash.isequal_4.5.0.tgz";
        url  = "https://registry.yarnpkg.com/lodash.isequal/-/lodash.isequal-4.5.0.tgz";
        sha1 = "415c4478f2bcc30120c22ce10ed3226f7d3e18e0";
      };
    }
    {
      name = "make_error___make_error_1.3.6.tgz";
      path = fetchurl {
        name = "make_error___make_error_1.3.6.tgz";
        url  = "https://registry.yarnpkg.com/make-error/-/make-error-1.3.6.tgz";
        sha1 = "2eb2e37ea9b67c4891f684a1394799af484cf7a2";
      };
    }
    {
      name = "mime_db___mime_db_1.49.0.tgz";
      path = fetchurl {
        name = "mime_db___mime_db_1.49.0.tgz";
        url  = "https://registry.yarnpkg.com/mime-db/-/mime-db-1.49.0.tgz";
        sha1 = "f3dfde60c99e9cf3bc9701d687778f537001cbed";
      };
    }
    {
      name = "mime_types___mime_types_2.1.32.tgz";
      path = fetchurl {
        name = "mime_types___mime_types_2.1.32.tgz";
        url  = "https://registry.yarnpkg.com/mime-types/-/mime-types-2.1.32.tgz";
        sha1 = "1d00e89e7de7fe02008db61001d9e02852670fd5";
      };
    }
    {
      name = "mkdirp___mkdirp_1.0.4.tgz";
      path = fetchurl {
        name = "mkdirp___mkdirp_1.0.4.tgz";
        url  = "https://registry.yarnpkg.com/mkdirp/-/mkdirp-1.0.4.tgz";
        sha1 = "3eb5ed62622756d79a5f0e2a221dfebad75c2f7e";
      };
    }
    {
      name = "node_fetch___node_fetch_2.6.1.tgz";
      path = fetchurl {
        name = "node_fetch___node_fetch_2.6.1.tgz";
        url  = "https://registry.yarnpkg.com/node-fetch/-/node-fetch-2.6.1.tgz";
        sha1 = "045bd323631f76ed2e2b55573394416b639a0052";
      };
    }
    {
      name = "normalize_path___normalize_path_3.0.0.tgz";
      path = fetchurl {
        name = "normalize_path___normalize_path_3.0.0.tgz";
        url  = "https://registry.yarnpkg.com/normalize-path/-/normalize-path-3.0.0.tgz";
        sha1 = "0dcd69ff23a1c9b11fd0978316644a0388216a65";
      };
    }
    {
      name = "ow___ow_0.27.0.tgz";
      path = fetchurl {
        name = "ow___ow_0.27.0.tgz";
        url  = "https://registry.yarnpkg.com/ow/-/ow-0.27.0.tgz";
        sha1 = "d44da088e8184fa11de64b5813206f9f86ab68d0";
      };
    }
    {
      name = "picomatch___picomatch_2.3.0.tgz";
      path = fetchurl {
        name = "picomatch___picomatch_2.3.0.tgz";
        url  = "https://registry.yarnpkg.com/picomatch/-/picomatch-2.3.0.tgz";
        sha1 = "f1f061de8f6a4bf022892e2d128234fb98302972";
      };
    }
    {
      name = "readdirp___readdirp_3.6.0.tgz";
      path = fetchurl {
        name = "readdirp___readdirp_3.6.0.tgz";
        url  = "https://registry.yarnpkg.com/readdirp/-/readdirp-3.6.0.tgz";
        sha1 = "74a370bd857116e245b29cc97340cd431a02a6c7";
      };
    }
    {
      name = "reflect_metadata___reflect_metadata_0.1.13.tgz";
      path = fetchurl {
        name = "reflect_metadata___reflect_metadata_0.1.13.tgz";
        url  = "https://registry.yarnpkg.com/reflect-metadata/-/reflect-metadata-0.1.13.tgz";
        sha1 = "67ae3ca57c972a2aa1642b10fe363fe32d49dc08";
      };
    }
    {
      name = "tinytim___tinytim_0.1.1.tgz";
      path = fetchurl {
        name = "tinytim___tinytim_0.1.1.tgz";
        url  = "https://registry.yarnpkg.com/tinytim/-/tinytim-0.1.1.tgz";
        sha1 = "c968a1e5559ad9553224ef7627bab34e3caef8a8";
      };
    }
    {
      name = "to_regex_range___to_regex_range_5.0.1.tgz";
      path = fetchurl {
        name = "to_regex_range___to_regex_range_5.0.1.tgz";
        url  = "https://registry.yarnpkg.com/to-regex-range/-/to-regex-range-5.0.1.tgz";
        sha1 = "1648c44aae7c8d988a326018ed72f5b4dd0392e4";
      };
    }
    {
      name = "tracer___tracer_1.1.5.tgz";
      path = fetchurl {
        name = "tracer___tracer_1.1.5.tgz";
        url  = "https://registry.yarnpkg.com/tracer/-/tracer-1.1.5.tgz";
        sha1 = "f53f761ed53c586a6c1d161581057c86780fa87d";
      };
    }
    {
      name = "ts_mixer___ts_mixer_6.0.0.tgz";
      path = fetchurl {
        name = "ts_mixer___ts_mixer_6.0.0.tgz";
        url  = "https://registry.yarnpkg.com/ts-mixer/-/ts-mixer-6.0.0.tgz";
        sha1 = "4e631d3a36e3fa9521b973b132e8353bc7267f9f";
      };
    }
    {
      name = "ts_node___ts_node_10.2.0.tgz";
      path = fetchurl {
        name = "ts_node___ts_node_10.2.0.tgz";
        url  = "https://registry.yarnpkg.com/ts-node/-/ts-node-10.2.0.tgz";
        sha1 = "f1e88249a00e26aa95e9a93c50f70241a8a1c4bb";
      };
    }
    {
      name = "tslib___tslib_2.3.1.tgz";
      path = fetchurl {
        name = "tslib___tslib_2.3.1.tgz";
        url  = "https://registry.yarnpkg.com/tslib/-/tslib-2.3.1.tgz";
        sha1 = "e8a335add5ceae51aa261d32a490158ef042ef01";
      };
    }
    {
      name = "type_fest___type_fest_1.4.0.tgz";
      path = fetchurl {
        name = "type_fest___type_fest_1.4.0.tgz";
        url  = "https://registry.yarnpkg.com/type-fest/-/type-fest-1.4.0.tgz";
        sha1 = "e9fb813fe3bf1744ec359d55d1affefa76f14be1";
      };
    }
    {
      name = "typescript___typescript_4.3.5.tgz";
      path = fetchurl {
        name = "typescript___typescript_4.3.5.tgz";
        url  = "https://registry.yarnpkg.com/typescript/-/typescript-4.3.5.tgz";
        sha1 = "4d1c37cc16e893973c45a06886b7113234f119f4";
      };
    }
    {
      name = "vali_date___vali_date_1.0.0.tgz";
      path = fetchurl {
        name = "vali_date___vali_date_1.0.0.tgz";
        url  = "https://registry.yarnpkg.com/vali-date/-/vali-date-1.0.0.tgz";
        sha1 = "1b904a59609fb328ef078138420934f6b86709a6";
      };
    }
    {
      name = "ws___ws_7.5.3.tgz";
      path = fetchurl {
        name = "ws___ws_7.5.3.tgz";
        url  = "https://registry.yarnpkg.com/ws/-/ws-7.5.3.tgz";
        sha1 = "160835b63c7d97bfab418fc1b8a9fced2ac01a74";
      };
    }
    {
      name = "yn___yn_3.1.1.tgz";
      path = fetchurl {
        name = "yn___yn_3.1.1.tgz";
        url  = "https://registry.yarnpkg.com/yn/-/yn-3.1.1.tgz";
        sha1 = "1e87401a09d767c1d5eab26a6e4c185182d2eb50";
      };
    }
  ];
}
