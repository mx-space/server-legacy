tag=v$(json -f package.json version)
git commit -a -m "release: $tag" &> /dev/null
git push
git tag -a "$tag" -m "Release $tag"
git push --tags