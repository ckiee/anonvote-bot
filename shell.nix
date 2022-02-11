{ pkgs ? import <nixpkgs> {} }:

with pkgs;

mkShell {
  nativeBuildInputs = [
    python3 ffmpeg yarn2nix
  ];
  buildInputs = [];
}
