with (import <nixpkgs> { });

let
  node = nodejs-16_x;
  y2n = yarn2nix-moretea.override {
    nodejs = node;
    yarn = yarn.override { nodejs = node; };
  };

in y2n.mkYarnPackage {
  name = "anonvote-bot";
  src = ./.;
  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;
  buildPhase = "yarn --offline run postinstall";
}
