#!/bin/bash
Rscript -e "rmarkdown::render_site()"
git add .
git commit -m "Update site"
git push
