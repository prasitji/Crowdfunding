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