#/bin/bash
rsync -urtvz  ./ aws_wordpress:/home/bitnami/apps/wordpress/htdocs/wp-content/plugins/sakubun/ --exclude-from='./exclude_me.txt'
