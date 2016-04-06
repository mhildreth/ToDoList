var app = angular.module("myApp", ['ui.bootstrap']);
app.controller("listController", function ($uibModal) {
	var vm = this;

	vm.list = initializeList();
	vm.filterMode = "Open";
	vm.filterText = ""
	vm.filterItems = filterItems;
	vm.addItem = addItem;
	vm.markItemComplete = markItemComplete;
	vm.deleteItem = deleteItem;
	vm.editItem = editItem;
	vm.editList = editList;
	vm.saveList = saveList;
	
	function editList(){
		var modal = $uibModal.open({
			templateUrl: 'listSettings.html',
			controller: 'listSettingsController as model',
			resolve: { list: { title: vm.list.title } }
		});
		modal.result.then(function(settings){
			vm.list.title = settings.title;
			vm.saveList();
		}, function(){
			// dismissed
		});
	};

	function addItem() {
		var modal = $uibModal.open({
			templateUrl: 'itemContent.html',
			controller: 'itemController as model',
			resolve: { item: {} }
		});
		modal.result.then(function (resultItem) {
			vm.list.items.push(resultItem);
			vm.saveList();
		}, function () {
			// dismissed
		});
	};

	function markItemComplete(item) {
		item.complete = true;
		item.dateCompleted = new Date();

		vm.saveList();
	};

	function editItem(item) {
		var modal = $uibModal.open({
			templateUrl: 'itemContent.html',
			controller: 'itemController as model',
			resolve: {
				item: copyItemProperties(item, {})
			}
		});
		modal.result.then(function (resultItem) {
			copyItemProperties(resultItem, item);
			vm.saveList();
		}, function () {
			// dismissed
		});
	};

	function deleteItem(item) {
		var modal = $uibModal.open({
			templateUrl: 'confirmDelete.html',
			controller: 'deleteController as model',
			resolve: { item: item }
		});
		modal.result.then(function (resultItem) {
			var index = vm.list.items.indexOf(resultItem);
			vm.list.items.splice(index, 1);
			vm.saveList();
		}, function () {
			// dismissed
		});

		vm.saveList();
	};

	function copyItemProperties(sourceItem, targetItem) {
		targetItem.title = sourceItem.title;
		targetItem.details = sourceItem.details;
		targetItem.completed = sourceItem.completed;
		return targetItem;
	};

	function initializeList() {
		var serializedList = localStorage.getItem("list");
		if (serializedList) {
			var deserializedList = angular.fromJson(serializedList);
			// Need to convert the date fields
			angular.forEach(deserializedList.items, function (item) {
				item.dateCreated = item.dateCreated ? new Date(item.dateCreated) : null;
				item.dateCompleted = item.dateCompleted ? new Date(item.dateCompleted) : null;
			});
			return deserializedList;
		}
		return {
			title: "My To-Do List",
			items: [{
				title: "This is a sample to-do item",
				details: "A to-do item can also have notes associated with it",
				dateCreated: new Date(),
				complete: false,
				dateCompleted: null
			}]
		};
	};

	function saveList() {
		var serializedList = angular.toJson(vm.list);
		localStorage.setItem("list", serializedList);
	};

	function filterItems(item) {
		var displayItem = true;
		
		// use the filter mode to check the status and the dates
		var mode = vm.filterMode;
		if (mode == "Open") {
			if (item.complete === true) {
				return false;
			}
		} else if (mode == "Review") {
			if (item.complete == 'undefined' || item.complete === false) {
				return false;
			}
			var now = new Date();
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			var yesterday = new Date(Number(today) - (1000 * 60 * 60 * 24));
			if (item.dateCompleted < yesterday) {
				return false;
			}
		} else if (mode == "All") {
		}
		
		// use the filter text to check the title and details
		var text = vm.filterText;
		if (text) {
			var lowerTitle = item.title.toLowerCase();
			var lowerDetails = item.details.toLowerCase();
			var lowerText = text.toLowerCase();
			if (lowerTitle.indexOf(lowerText) == -1 && lowerDetails.indexOf(lowerText) == -1) {
				return false;
			}
		}

		return displayItem;
	};
}).controller('itemController', function ($modalInstance, item) {

	var vm = this;

	vm.item = item;

	vm.saveItem = saveItem;
	vm.cancel = cancel;

	function saveItem() {
		$modalInstance.close(vm.item);
	};

	function cancel() {
		$modalInstance.dismiss();
	};
}).controller('deleteController', function ($modalInstance, item) {

	var vm = this;

	vm.item = item;

	vm.deleteItem = deleteItem;
	vm.cancel = cancel;

	function deleteItem() {
		$modalInstance.close(vm.item);
	};

	function cancel() {
		$modalInstance.dismiss();
	};
}).controller('listSettingsController', function($modalInstance, list){
	
	var vm = this;
	
	vm.settings = { title: list.title };
	
	vm.saveSettings = saveSettings;
	vm.cancel = cancel;
		
	function saveSettings(){
		$modalInstance.close(vm.settings);
	};
	
	function cancel(){
		$modalInstance.dismiss();
	};
});