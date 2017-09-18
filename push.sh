#!/bin/bash

echo '';
echo -n "[+] commit ➜ ";
read commit;

if [ "$commit" ]; then
    git add .;
    git commit -m "$commit";
    git push -u origin master;
fi
