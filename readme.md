mkdir -p ~/my-express-app/ # create a new folder
cd ~/my-express-app/ # navigate into the folder
git clone https://github.com/bunjongy/Hellowold.git posttest
cd posttest
npm install # install dependencies
pm2 start hello.js