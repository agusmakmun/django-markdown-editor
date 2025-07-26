#!/bin/bash

echo '';
echo " a. development";
echo " b. master";
echo -n "[+] branch [a/B] ➜ ";
read -r branch;

echo -n "[+] commit ➜ ";
read -r commit;

# package folder & name
package=martor

if [ "$commit" ] && [ "$branch" ]; then
    if [ "$branch" == 'b' ] || [ "$branch" == 'B' ]; then
        echo -n "[+] upgrade version? [y/N] ➜ ";
        read -r upgrade_version;

        if [ "$upgrade_version" == 'y' ] || [ "$upgrade_version" == 'Y' ]; then
            # https://stackoverflow.com/a/3250387/6396981
            old_version=$(grep '__version__ = ".*"' $package/__init__.py | cut -d '"' -f 2);
            old_release_date=$(grep '__release_date__ = ".*"' $package/__init__.py | cut -d '"' -f 2);
            echo "[i] current version is $old_version, released at $old_release_date";

            last_numb_old_version=$(echo "$old_version" | grep -o .$);
            last_numb_new_version=$(( last_numb_old_version + 1 ))

            suggested_version="${old_version%?}${last_numb_new_version}"
            echo -n "[+] type new version [default:$suggested_version] ➜ ";
            read -r input_new_version;

            if [ ! "$input_new_version" ]; then
              input_new_version=$suggested_version;
            fi

            # 04-Sep-2022
            new_release_date=$(date +%d-%b-%Y);

            # https://stackoverflow.com/a/525612/6396981
            # sed -i -e => for linux user
            # sed -i "" => for mac user
            echo "[i] updating new version..."
            find $package/ -type f \( -name "*.py" -or -name "*.css" -or -name "*.js" \) -exec sed -i "" "s/$old_version/$input_new_version/g" {} \;
            find $package/ -type f \( -name "*.py" -or -name "*.css" -or -name "*.js" \) -exec sed -i "" "s/$old_release_date/$new_release_date/g" {} \;
        fi

        git add .;
        git commit -m "$commit";
        git checkout master;
        git push origin master;

        if [ "$upgrade_version" == 'y' ] || [ "$upgrade_version" == 'Y' ]; then
            echo "[i] updating new git tag to v$input_new_version"
            git tag -a v"$input_new_version" -m "launch v$input_new_version"
            git push origin v"$input_new_version"

            echo "[i] preparing upload to pypi..."

            # Check if hatch is available
            if ! [ -x "$(command -v hatch)" ]; then
                echo "[!] Error: hatch is not installed or not in PATH"
                exit 1
            fi

            echo "[i] building package for version $input_new_version..."
            hatch build

            # Verify the built package has the correct version
            echo "[i] verifying package version..."
            if [ -f "dist/$package-$input_new_version.tar.gz" ]; then
                echo "[i] package built successfully: $package-$input_new_version.tar.gz"
                echo "[i] publishing to PyPI..."
                hatch publish
            else
                echo "[!] Error: Package not found. Expected: dist/$package-$input_new_version.tar.gz"
                exit 1
            fi
        fi
    else
        git add .;
        git commit -m "$commit";
        git checkout development;
        git push origin development;
    fi

    echo "[i] successfully pushed at $(date)";
else
    echo "[!] not pushed!";
fi
