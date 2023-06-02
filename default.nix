{ pkgs }:

with pkgs;

let
  node = nodejs_20;
  y2n = yarn2nix-moretea.override {
    nodejs = node;
    yarn = yarn.override { nodejs = node; };
  };

in y2n.mkYarnPackage {
  name = "anonvote-bot";
  src = ./.;
  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;
  yarnNix = ./yarn.nix;
  buildPhase = "yarn --offline run postinstall";
  nativeBuildInputs = [ makeWrapper ];
  postFixup = ''
    wrapProgram $out/bin/anonvote-bot --prefix PATH : ${lib.makeBinPath [ ffmpeg ]}
  '';
}
