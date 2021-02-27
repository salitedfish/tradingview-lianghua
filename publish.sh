cp -r dist ssi.33.cn
tar -czf ssi.33.cn.tar ssi.33.cn
rm -rf ssi.33.cn
scp ssi.33.cn.tar -p 2795 root@116.62.211.123:/usr/share/nginx/html/ssi.33.cn.tar
rm -rf ssi.33.cn.tar
ssh -o StrictHostKeyChecking=no -p 2795 root@116.62.211.123 'cd /usr/share/nginx/html/ && rm -rf ssi.33.cn && tar -xzf ssi.33.cn.tar && rm -rf ssi.33.cn.tar'