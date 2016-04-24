var app = angular.module("app", ['ngRoute']).config(function($routeProvider) {

	$routeProvider.when('/home', {
		templateUrl: 'home.html',
		controller: 'HomeController'
	});

	$routeProvider.otherwise({ redirectTo: '/home'});

});

app.controller('HomeController', function($scope, $http) {

	var doc = document.getElementById("drophere");

	doc.ondragover = function() {
		this.className = 'file';
		return false;
	};

	doc.ondragleave = function() {
		this.className = '';
		return false;
	}

	doc.ondragend = function() {
		this.className = '';
		return false;
	}

	doc.ondrop = function(event) {
		event.preventDefault && event.preventDefault();

		this.className = '';
		var files = event.dataTransfer.files;

		if (files.length != 1) {
			alert("Only uplaod one http archive at a time.");
			return;
		}

		theFiles = files;

		var formData = new FormData();
		formData.append('file', files[0]);

		$http({
			method: 'POST',
			url: '/har',
			headers : {
				'Content-Type' : undefined
			},
			data: formData
		}).
		then(function(result) {
			$scope.harData = result.data.har;
			$scope.transferred = result.data.transferred;
			$scope.onload = Math.floor(result.data.har.log.pages[0].pageTimings.onLoad);
			mydata = $scope.harData;

			configureChartSettings();
			displayResourceTypeChart(result.data);
			displayResourceSizeChart(result.data);

			

		});

		return false;
	}

});

function configureChartSettings() {
	Chart.defaults.global.legend.position = "bottom";
}

function displayResourceTypeChart(data) {
	var labels = [];
	var categoryData = [];
	var colors = [];
	var max = data.chartData[data.chartData.length - 1].num;

	data.chartData.forEach(function (resourceType) {
		labels.push(resourceType.name);
		categoryData.push(resourceType.num);
	});

	var data = {
		labels: labels,
		datasets: [{
			label: 'Number of requests',
			data: categoryData,
			backgroundColor: "rgba(0,102,204,0.2)",
			borderColor: "rgba(0,102,204,1)",
			borderWidth: 1,
			hoverBackgroundColor: "rgba(0,102,204,0.2)",
			hoverBorderColor: "rgba(0,102,204,1)",
		}]
	};

	var ctx = $("#resource-type-chart").get(0).getContext("2d");
	var chart = new Chart(ctx, {
		type: 'bar',
		data: data
	});
}

function displayResourceSizeChart(data) {
	var labels = [];
	var categoryData = [];
	var colors = [];
	var max = data.chartData[data.chartData.length - 1].num;

	data.chartData.forEach(function (type, i) {
		labels.push(type.name);
		categoryData.push(type.totalSize);
		colors.push(getPieSliceColor(i));
	});

	var data = {
		labels: labels,
		datasets: [{
			data: categoryData,
			backgroundColor: colors,
			hoverBackgroundColor: []
		}]
	};

	var ctx = $("#resource-size-chart").get(0).getContext("2d");
	var chart = new Chart(ctx, {
		type: 'pie',
		data: data,
		options : {
			tooltips : {
				callbacks : {
					label : function(tooltipitem, data) {
						var index = tooltipitem.index;
						var rawSize = data.datasets[0].data[index];

						return data.labels[index] + ": " + formatSizeUnits(rawSize);
					}
				}
			}
		}
	});
}

function getPieSliceColor(index) {

	var colors = ["4D4D4D",
		"5DA5DA",
		"FAA43A",
		"60BD68",
		"F17CB0",
		"B2912F",
		"B276B2",
		"DECF3F",
		"F15854"];

	return "#" + colors[index%colors.length]
}

function formatSizeUnits(bytes) {
	
	if (bytes >= 1073741824) {
		bytes = (bytes/1073741824).toFixed(2) + ' GB';
	} else if (bytes >= 1048576)    {
		bytes = (bytes/1048576).toFixed(2) + ' MB';
	} else if (bytes >= 1024) {
		bytes = (bytes/1024).toFixed(2) + ' KB';
	} else if (bytes > 1) {
		bytes = bytes + ' bytes';
	} else if (bytes == 1) {
		bytes = bytes + ' byte';
	} else {
		bytes = '0 byte';
	}

	  return bytes;
}