with (import <nixpkgs> { });

let
  node = nodejs-16_x;
  y2n = yarn2nix-moretea.override {
    nodejs = node;
    yarn = yarn.override { nodejs = node; };
  };

in y2n.mkYarnPackage {
  name = "sysyelper";
  src = ./.;
  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;
  yarnNix = ./yarn.nix;
  buildPhase = "yarn --offline run postinstall";
}
