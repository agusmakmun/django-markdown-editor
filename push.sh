#!/bin/bash

echo '';
echo " a. development";
echo " b. master";
echo -n "[+] branch [a/B] ➜ ";
read branch;

echo -n "[+] commit ➜ ";
read commit;

if [ "$commit" ] && [ "$branch" ]; then
  git add .;
  git commit -m "$commit";

  if [ "$branch" == 'b' ] || [ "$branch" == 'B' ]; then
    git checkout master;
    git push origin master;
  else
    git checkout development;
    git push origin development;
  fi

  echo "[i] successfully pushed at" $(date);
else
  echo "[!] not pushed!";
fi
