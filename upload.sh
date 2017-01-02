#!/bin/bash

# Command to upload new version release at pypi
# ./upload.sh pypi
if [ "$1" == "pypi" ]; then
    python setup.py sdist upload -r pypi
fi

if [ "$1" == "git" ]; then

    # Command to upload new tag version
    # by checking the last version release.
    # ./upload.sh git tag
    if [ "$2" == "tag" ]; then
        # check last release version and plus it with 1
        # eg: v1.0.8 => v1.0.9
        new_version=$(
          git tag | tail -n1 | awk -F '[/.]' '{ gsub("v", "", $1); print $1$2$3 + 1}' | fold -w1 | paste -sd.
        );
        # new_version = git tag | tail -n1 | perl -pe 's/\v//g;s/\.//g;$_++;s/(\d)/$1./g;s/.$/\n/;' # v1.0.9 => v1.1.0
        # echo "git tag -a v$new_version -m 'Release v$new_version'";
        git tag -a "v$new_version" -m "Release v$new_version";
        git push origin "v$new_version";
        echo "Current version: v$new_version";
    fi

    # Command to push new git commit
    # ./upload.sh git commit
    if [ "$2" == "commit" ]; then
        echo -n "Commit name > ";
        read commit_name

        if [ "$commit_name" ]; then
            git add .;
            git commit -m "$commit_name";
            git push -u origin master;
        fi
    fi
fi
