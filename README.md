# Development environment

Required software: VirtualBox, Vagrant

1. Setup vagrant ```git clone https://github.com/hijaq/mean-vagrant.git```
2. cd mean-vagrant/www
3. Download backend code to local ```git clone https://github.com/nowanswers/nowansr.com.git .```
4. cd ..
5. Turn on vm ```vagrant up```
6. SSH to vm ```vagrant ssh```
7. (Optional) Install all node modules ```npm install```
8. Run node 
  * ```sudo node www/app``` or
  * ```sudo nodemon www/app```
