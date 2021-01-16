# Crowdfunding
# Name of Project
Project Detail

## กำหนดค่าสิ่งแวดล้อม
สร้าง Directory สำหรับบันทึก Projectนี้ และ ใช้คำสั่งต่อไปนี้เพื่อสร้างและย้ายเข้าไปยัง Name Directory
```
mkdir Name
cd Name
```

ดาวน์โหลดโครงสร้างของโปรเจ็ค pet-shop ซึ่งมีอยู่ใน Truffle Framework โดยใช้คำสั่งต่อไปนี้
```
truffle unbox pet-shop
```


### 1. Create Smart Contract
ใช้ Visual Studio Code เพื่อสร้างไฟล์ชื่อ Name.sol ในไดเร็กทอรี contracts โดยมีโค้ดดังนี้
```
pragma solidity ^0.5.0;

contract crowdfunding {
    address[6] public investers;

    function Adopt(uint companyId) public returns (uint) {
        require(companyId >= 0 && companyId <=5);
        investers[companyId] = msg.sender;
        return companyId;
    }

    function getinvesters() public view returns (address[6] memory) {
        return investers;
    }
}
```

### 2. Compile และ Migrate
ทำการ Compile Smart Contracts โดยใช้คำสั่ง
```
truffle compile
```


ใช้ Visual Studio Code ในการสร้างไฟล์ 2_deploy_contracts.js ในไดเร็กทอรี migrations ดังนี้
```
var crowdfunding = artifacts.require("crowdfunding");

module.exports = function(deployer) {
  deployer.deploy(crowdfunding);
};
```
เปิดโปรแกรม Ganache โดยการใช้เมาส์ดับเบิลคลิกที่ชื่อไฟล์ จากนั้น Click ที่ Workspace ที่ต้องการใช้งาน
จากนั้นทำการ Migrate โดยใช้คำสั่ง 
```
truffle migrate
```

#### 3.1 แก้ไข image
ให้นำไฟล์ภาพที่ต้องการแสดงผลไปไว้ใน Directory image

#### 3.2 แก้ไข pets.json
ทำการ เปลี่ยนชื่อจาก pets.json ให้เป็น companys.json และ แก้ไขโค๊ดให้เป็นดังต่อไปนี้
```
[
  {
    "id": 0,
    "name": "AD COMPANY",
    "picture": "images/1AE.JPG",
    "fund": 8000000,
    "interest": "7.5 PERCENT",
    "ratio": "5.5 TIMES"
  },
  {
    "id": 1,
    "name": "CS COMPANY",
    "picture": "images/2CS.JPG",
    "fund": 5000000,
    "interest": "12.5 PERCENT",
    "ratio": "3 TIMES"
  },
  {
    "id": 2,
    "name": "AEE COMPANY",
    "picture": "images/3AEE.JPG",
    "fund": 10000000,
    "interest": "10.6 PERCENT",
    "ratio": "5 TIMES"
  },
  {
    "id": 3,
    "name": "SCC COMPANY",
    "picture": "images/4SCC.JPG",
    "fund": 2000000,
    "interest": "14.6 PERCENT",
    "ratio": "5 TIMES"
  },
  {
    "id": 4,
    "name": "TM COMPANY",
    "picture": "images/5TM.JPG",
    "fund": 8000000,
    "interest": "9.35 PERCENT",
    "ratio": "2 TIMES"
  },
  {
    "id": 5,
    "name": "AF COMPANY",
    "picture": "images/6AF.JPG",
    "fund": 3000000,
    "interest": "11.85 PERCENT",
    "ratio": "5 TIMES"
  }
 
]
```
#### 3.3 แก้ไข app.js
ทำการแก้ไขตัวแปรต่างๆ สำหรับ Back-end

```
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load companys.
    $.getJSON('../companys.json', function(data) {
      var companysRow = $('#companysRow');
      var companyTemplate = $('#companyTemplate');

      for (i = 0; i < data.length; i ++) {
        companyTemplate.find('.panel-title').text(data[i].name);
        companyTemplate.find('img').attr('src', data[i].picture);
        companyTemplate.find('.company-interest').text(data[i].interest);
        companyTemplate.find('.company-fund').text(data[i].fund);
        companyTemplate.find('.company-ratio').text(data[i].ratio);
        companyTemplate.find('.btn-Adopt').attr('data-id', data[i].id);

        companysRow.append(companyTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('crowdfunding.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var crowdfundingArtifact = data;
      App.contracts.crowdfunding = TruffleContract(crowdfundingArtifact);

      // Set the provider for our contract
      App.contracts.crowdfunding.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the Adopted pets
      return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-Adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var crowdfundingInstance;

    App.contracts.crowdfunding.deployed().then(function (instance) {
      crowdfundingInstance = instance;

      return crowdfundingInstance.getBookers.call();
    }).then(function (Bookers) {
      for (i = 0; i < Bookers.length; i++) {
        if (Bookers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-company').eq(i).find('button').text('Booked').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var companyID = parseInt($(event.target).data('id'));

    var crowdfundingInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.crowdfunding.deployed().then(function (instance) {
        crowdfundingInstance = instance;

        // Execute Adopt as a transaction by sending account
        return crowdfundingInstance.Adopt(companyID, { from: account });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
```

### 3. แก้ไข Front-end 
ทำการแก้ไขในส่วนของ UI ให้มีการแสดงผลตามต้องการ

```
ines (56 sloc) 2.51 KB
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Crowdfunding</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-sm-8 col-sm-push-2">
          <h1 class="text-center">Crowdfunding</h1>
          <hr/>
          <br/>
        </div>
      </div>

      <div id="companysRow" class="row">
        <!-- companyS LOAD HERE -->
      </div>
    </div>

    <div id="companyTemplate" style="display: none;">
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="panel panel-default panel-company">
          <div class="panel-heading">
            <h3 class="panel-title">Scrappy</h3>
          </div>
          <div class="panel-body">
            <img alt="140x140" data-src="holder.js/140x140" class="img-rounded img-center" style="width: 100%;" src="https://animalso.com/wp-content/uploads/2017/01/Golden-Retriever_6.jpg" data-holder-rendered="true">
            <br/><br/>
            <strong>Interest Rate</strong>: <span class="company-interest">Golden Retriever</span><br/>
            <strong>Fund Amount</strong>: <span class="company-fund">3</span><br/>
            <strong>DE Ratio</strong>: <span class="company-ratio">Warren, MI</span><br/><br/>
            <button class="btn btn-default btn-Adopt" type="button" data-id="0">Booking</button>
          </div>
        </div>
      </div>
    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/web3.min.js"></script>
    <script src="js/truffle-contract.js"></script>
    <script src="js/app.js"></script>
  </body>
</html>
```

### 4.ทำการสั่ง Run

```
npm run dev
```
Firefox จะถูกเรียกที่ http://localhost:3000 เพื่อแสดงผลลัพธ์
