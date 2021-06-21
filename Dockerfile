FROM nginx:latest

MAINTAINER shizhendong shizhendong@zdjizhi.com

# 将dist文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面
COPY dist/  /usr/share/nginx/html/

# nginx 配置 ， 制作镜像时不做处理 ， 容器可自己挂载配置文件
#COPY nginx.conf /etc/nginx/nginx.conf
