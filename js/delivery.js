var gbcDeliveryBoardId = 'gbc-delivery-board-id';
var deliveryBoardId = getLocalStorage(gbcDeliveryBoardId);

var gbcDeliverTo = 'gbc-deliver-to';
var gbcDeliverInvoices = 'gbc-deliver-invoices';
var gbcDeliverLeave = 'gbc-deliver-leave';
var gbcDeliverArrive = 'gbc-deliver-arrive';

let mondayLeaveColumnId = 'hour';
let mondayArriveColumnId = 'hour5';
let mondayInvoicesDeliveredColumnId = 'text';
let mondayDeliveryDate = 'date5';

if(window.location.hash) {
  // remove the hash and split the hash
  var hash = window.location.hash.substr(1).split('-');

  if (hash.length == 3) {
    var key = hash[0];
    var userId = hash[1];
    var deliveryBoardId = hash[2];

    setLocalStorage(gbcKey, key);
    setLocalStorage(gbcUserId, userId);
    setLocalStorage(gbcDeliveryBoardId, deliveryBoardId);

    // redirect without any hash
    window.location.replace('delivery.html');
  } else {
    notification('Not enough values in settings.', 'danger');
  }
}

document.addEventListener("DOMContentLoaded", function(event) {

  // set today's date by default
  var today = new Date();
  gbc('#delivery-date').val(today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2));

  var deliverTo = getLocalStorage(gbcDeliverTo);
  var deliverInvoices = getLocalStorage(gbcDeliverInvoices);
  var deliverLeave = getLocalStorage(gbcDeliverLeave);
  var deliverArrive = getLocalStorage(gbcDeliverArrive);

  gbc('#delivery-date').on('change', function(e) {
    getDeliveries();
  });

  gbc('#delivery-company').on('change', function(e) {
    var deliveryCompany = e.target.value;
    setLocalStorage(gbcDeliverTo, deliveryCompany);
  }).val(deliverTo);

  gbc('#delivery-invoices').on('change', function(e) {
    var deliveryInvoices = e.target.value;
    setLocalStorage(gbcDeliverInvoices, deliveryInvoices);
  }).val(deliverInvoices);

  gbc('#delivery-leave').on('change', function(e) {
    var deliveryLeave = e.target.value;
    setLocalStorage(gbcDeliverLeave, deliveryLeave);
  }).val(deliverLeave);

  gbc('#delivery-arrive').on('change', function(e) {
    var deliveryArrive = e.target.value;
    setLocalStorage(gbcDeliverArrive, deliveryArrive);
  }).val(deliverArrive);

  gbc('#add-delivery').on('click', function(e) {
    createDelivery();
  });

  gbc('#delivery-refresh').on('click', function(e) {
    getDeliveries();
  });

  logOnToMonday();

});

function logOnToMonday() {

  var mondayQuery = '{ users (ids: [' + userId + ']) { name } }';

  callMonday(mondayQuery, function(data) {
    var loggedInUser = data['data']['users'];

    if (loggedInUser.length != 1) {
      showError('Could not log on');
    } else {
      userName = data['data']['users'][0]['name'];
      gbc('#user').text('Logged on as ' + userName);
      hideLoading();
      getDeliveries();
    }
  });
}

function getDeliveries() {

  showLoading('Getting deliveries');

  gbc('#deliveries').html(''); // clear deliveries

  var deliveryDate = gbc('#delivery-date').val();
  var mondayQuery = '{ items_by_column_values(board_id: ' + deliveryBoardId +
  ', column_id: "' + mondayDeliveryDate + '", column_value: "' + deliveryDate +
  '") { id name column_values { id title text value } } }';

  callMonday(mondayQuery, function(data) {
    var deliveries = data['data']['items_by_column_values'];

    if (deliveries.length > 0) {
      for (i = 0; i < deliveries.length; i++) {
        showDelivery(deliveries[i])
      }
    }

    hideLoading();
  });

}

function showDelivery(delivery) {

  let toFrom = delivery['name'];
  let leave = delivery['column_values'].find(x => x.id === mondayLeaveColumnId)['text'];
  let arrive = delivery['column_values'].find(x => x.id === mondayArriveColumnId)['text'];
  let delivered = delivery['column_values'].find(x => x.id === mondayInvoicesDeliveredColumnId)['text'];
  let deliveredById = JSON.parse(delivery['column_values'].find(x => x.id === 'people')['value'])['personsAndTeams'][0]['id'];

  if (deliveredById == userId) {

    // card
    var cardDiv = document.createElement('div');
    cardDiv.classList.add('uk-card', 'uk-card-default', 'uk-card-body', 'uk-card-small', 'uk-margin');
    cardDiv.setAttribute('uk-scrollspy', 'cls:uk-animation-fade');

    // card > flex
    var cardFlexDiv = document.createElement('div');
    cardFlexDiv.classList.add('uk-flex', 'uk-flex-middle');

    // card > flex > text
    var div = document.createElement('div');
    div.classList.add('uk-flex-1');
    div.innerHTML = toFrom + ' [' + leave + ' - ' + arrive + ']';

    cardFlexDiv.appendChild(div);

    if (delivered != '') {
      var divJobs = document.createElement('span');
      divJobs.classList.add('uk-flex-none', 'uk-badge', 'uk-padding-small');
      divJobs.setAttribute('uk-tooltip', 'title: ' + delivered);
      divJobs.innerHTML = 'inv';
      cardFlexDiv.appendChild(divJobs);
    }

    // card > flex > button div
    var cardButtonDiv = document.createElement('div');
    cardButtonDiv.classList.add('uk-flex-none');

    // card > flex > button div > button
    var button = document.createElement('button');
    button.classList.add('uk-button', 'uk-border-rounded');
    button.classList.add('uk-button', 'uk-margin-small-left');
    button.setAttribute('data-delivery-id', delivery['id']);

    button.classList.add('uk-button-danger');
    button.setAttribute('uk-tooltip', 'title: Remove delivery');
    button.innerHTML = '<span uk-icon="icon: minus-circle"></span>';

    button.addEventListener('click', function(e) {
      deleteDelivery(this.getAttribute('data-delivery-id'));
    });

    cardFlexDiv.appendChild(button);
    cardDiv.appendChild(cardFlexDiv);
    document.getElementById('deliveries').appendChild(cardDiv);
  }
}

function createDelivery() {

  var deliveryDate = gbc('#delivery-date').val();
  var deliveryCompany = gbc('#delivery-company').val();
  var deliveryInvoices = gbc('#delivery-invoices').val();
  var deliveryLeave = gbc('#delivery-leave').val();
  var deliveryArrive = gbc('#delivery-arrive').val();

  if (!deliveryCompany || !deliveryLeave || !deliveryArrive) {
    UIkit.notification({
      message: 'Ensure company, leave time and arrival time are filled in.',
      status: 'danger',
      pos: 'top-center',
      timeout: 5000
    });
    return;
  }

  showLoading('Adding delivery');

  var deliveryLeaveJson = { hour: parseInt(deliveryLeave.split(':')[0]), minute: parseInt(deliveryLeave.split(':')[1]) };
  var deliveryArriveJson = { hour: parseInt(deliveryArrive.split(':')[0]), minute: parseInt(deliveryArrive.split(':')[1]) };
  var peopleJson = { personsAndTeams:[{"id": userId, "kind": "person"}]};
  var dateJson = { date: deliveryDate };

  var mondayQuery = 'mutation { create_item ( board_id: ' + deliveryBoardId + ', group_id: "new_group53745"' +
    ', item_name: "' + deliveryCompany + '"' +
    ', column_values: ' +
      JSON.stringify(
        '{\"' + mondayLeaveColumnId + '\":' + JSON.stringify(deliveryLeaveJson) + ', ' +
        '\"' + mondayArriveColumnId + '\":' + JSON.stringify(deliveryArriveJson) + ', ' +
        '\"' + mondayInvoicesDeliveredColumnId + '\":' + JSON.stringify(deliveryInvoices) + ', ' +
        '\"' + mondayDeliveryDate + '\":' + JSON.stringify(dateJson) + ', ' +
        '\"people\":' + JSON.stringify(peopleJson) + '}'
      ) +
    ') { id } }';

  callMonday(mondayQuery, function(data) {
    // setTimeout(function () {
      // clear values
      gbc('#delivery-company').val('');
      gbc('#delivery-invoices').val('');
      gbc('#delivery-leave').val('');
      gbc('#delivery-arrive').val('');

      clearLocalStorage(gbcDeliverTo);
      clearLocalStorage(gbcDeliverInvoices);
      clearLocalStorage(gbcDeliverLeave);
      clearLocalStorage(gbcDeliverArrive);

      hideLoading();
      getDeliveries();
    // }, 3000); // wait 3 seconds for monday to refresh
  });
}

function deleteDelivery(deliveryId) {
  var confirmDelete = confirm("Are you sure you want to delete this delivery?");

  if (confirmDelete) {
    showLoading('Deleting delivery');

    var mondayQuery = 'mutation { archive_item (item_id: ' + deliveryId + ') { id } }';

    callMonday(mondayQuery, function(data) {
      // setTimeout(function () {
        hideLoading();
        getDeliveries();
      // }, 3000); // wait 3 seconds for monday to refresh
    });
  }
}
