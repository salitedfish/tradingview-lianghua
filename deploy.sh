# -o StrictHostKeyChecking=no 解决 本地主机的key发生了变化，因此每次SSH链接都会有提示
cp -r dist tv
tar -czf tv.tar tv
rm -rf tv
scp tv.tar root@47.74.190.154:/usr/share/nginx/html/tv.tar
rm -rf tv.tar
ssh -o StrictHostKeyChecking=no root@47.74.190.154 'cd /usr/share/nginx/html/ && rm -rf tv && tar -xzf tv.tar && rm -rf tv.tar'
echo 'done http://47.74.190.154:9005'