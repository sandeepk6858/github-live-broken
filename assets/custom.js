$(document).ready(function () {
	var orderName = $('#order_name').attr('class');
	if(orderName != ""){
	$.ajax({
        crossDomain: true,
		type:"POST",
		url: 'https://apps.freshtrends.com/API/order_delivery_Date.php',
		data: {name:orderName},
		success:function(result) {
			$(".deliveryDate").text(result);
		}
      });
	}
	
	
	$(".stop_vid").click(function() {
		$("video")[0].pause();
		$("iframe").each(function() {
			var src= $(this).attr('src');
			$(this).attr('src',src);  
		});
	});
	
	//custom request jwellery form
	$("#send_request").click(function(e){
		
		e.preventDefault();
		var custom_size = $("#w3review").val();
		var first_name = $("#first_name").val();
		var last_name = $("#last_name").val();
		var phone = $("#phone").val();
		var email = $("#eamil").val();
		
		if(custom_size != "" && first_name!= "" && last_name != "" && phone != "" && email != ""){
			if(grecaptcha.getResponse() == "") {
				$("#recaptha_validate").show();
				setTimeout(function() {
					$("#recaptha_validate").hide()
				}, 5000);
			}else{
				$.ajax({
					type:"POST",
					url: 'https://apps.freshtrends.com/API/send_email.php',
					data: {custom_size:custom_size,first_name:first_name,last_name:last_name,phone:phone,email:email},
					success:function(result) {
                      //console.log(result);
                        if(result == 1){
                          $("#main_form_custom_request").hide();
                          $("#alert_message").show();
                          
                          setTimeout(function() {
                              window.location.href = "https://www.freshtrends.com/";
                          }, 5000);
                        }else{
                        	$("#error_submit").show();
                            setTimeout(function() {
                                $("#error_submit").hide()
                            }, 5000);
                        }
					}
				});
			}
		}else{
			$("#error").show();
			setTimeout(function() {
				$("#error").hide()
			}, 5000);
			
		}
	});
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const sku = urlParams.get('sku');
	const title = urlParams.get('title');
	
	$('#mas_sku').val(sku);
	$('#mas_title').val(title);
	if(title != null && sku != null){
		$('#w3review').val(title +"         "+ sku);
	}
   
	$('.slider-for').slick({
	   slidesToShow: 1,
	   slidesToScroll: 1,
	   arrows: true,
	   fade: true,
	   asNavFor: '.slider-nav'
	});
	 $('.slider-nav').slick({
	   slidesToShow: 3,
	   slidesToScroll: 1,
	   asNavFor: '.slider-for',
	   dots: true,
	   focusOnSelect: true,
	 });
	
  	//console.log = function() {}
	
	/************* GET vistior IP address ********************/
  navigator.saysWho = (() => {
	  const { userAgent } = navigator
	  let match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
	  let temp

	  if (/trident/i.test(match[1])) {
		temp = /\brv[ :]+(\d+)/g.exec(userAgent) || []

		return `IE ${temp[1] || ''}`
	  }

	  if (match[1] === 'Chrome') {
		temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/)

		if (temp !== null) {
		  return temp.slice(1).join(' ').replace('OPR', 'Opera')
		}

		temp = userAgent.match(/\b(Edg)\/(\d+)/)

		if (temp !== null) {
		  return temp.slice(1).join(' ').replace('Edg', 'Edge (Chromium)')
		}
	  }

	  match = match[2] ? [ match[1], match[2] ] : [ navigator.appName, navigator.appVersion, '-?' ]
	  temp = userAgent.match(/version\/(\d+)/i)

	  if (temp !== null) {
		match.splice(1, 1, temp[1])
	  }

	  return match.join(' ')
	})()

		$.getJSON('https://ipv4.jsonip.com/?callback=?').done(function(data) {
			var ip_address = window.JSON.parse(JSON.stringify(data, null, 2));
			ip_address = ip_address.ip;
			var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
			var device = "";
			if(isMobile){
				device = "Mobile";
			}else{
				device = "Desktop";
			}
			var browser = navigator.saysWho;

			/* $.ajax({
				type: "POST",
				url: "https://apps.freshtrends.com/API/Location/customer_location.php",
				data: {"ip_address":ip_address,"isMobile":device,"browser":browser},
				complete: function(msg) {
				 console.log(msg);
				},
			}); */

			
		});
	
		/**********For replace url*************/	
		function update_url(url) {
			history.pushState(null, null, url);
		}
	
	/******** Toggle button for in stock variants ********/
	/******** Toggle button for in stock variants ********/
	$('#toggle_in_stock').click(function() {
        if (this.checked) {
			var current_product_id = $(this).val();
			//console.log(current_product_id);
            if(current_product_id != ""){
				$.ajax({
				crossDomain: true,
				type:"POST",
				url: 'https://apps.freshtrends.com/API/Stock/in_stock.php',
				data: {product_id:current_product_id,checked:"Yes"},
				success:function(result) {
					//console.log(result);
					if(result != "out of stock"){
						var data = $.parseJSON(result);
						 $.each(data, function(index, value){
							 if(index == "option1"){
								 var arrayLength = data.option1.length;
								 $('#SingleOptionSelector-0').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									 if(i == 0){
										$("#SingleOptionSelector-0").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									 }else{
										 $("#SingleOptionSelector-0").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
							 }else if(index == "option2"){
								 var arrayLength = data.option2.length;
								 $('#SingleOptionSelector-1').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										$("#SingleOptionSelector-1").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-1").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
								
							 }else if(index == "option3"){
								  var arrayLength = data.option3.length;
								 $('#SingleOptionSelector-2').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
									
								 }
							 } 
						});
						
						if( $('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length && $('#SingleOptionSelector-2').length){
							//console.log('test1');
							 var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val() +" / "+$('#SingleOptionSelector-2').find(":selected").val();
						}else if($('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length){
							//console.log('test2');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val();
						}else{
							//console.log('test3');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val();
						}
						
						
							//console.log(seleted_variant_select);
							$('.custom-select_instock > option').each((index, obj) => {
								
								if($.trim(seleted_variant_select) == $.trim($(obj).text())){
									var selcted_option_value = $.trim($(obj).val());
									var selected_variant = getUrlParameter('variant');
									var newUrl = location.href.replace("variant="+selected_variant, "variant="+selcted_option_value);
									update_url(newUrl);
									$(".custom-select_instock option:selected").removeAttr("selected");
									$(".custom-select_instock option[value='"+selcted_option_value+"']").attr('selected',true);
									
									//Get variant price 
									$.ajax({
										crossDomain: true,
										type:"POST",
										url: 'https://apps.freshtrends.com/API/Stock/get_variant_price.php',
										data: {variant_id:selcted_option_value},
										success:function(result) {
											//console.log(result);
											if(result != "error"){
												$(".update_custom_price").text("$"+result);
												$(".update_custom_price").attr("content",result+".0");
											}
										}
									});
									//Get estimated delivery time of variant
									$.ajax({
										crossDomain: true,
										type:"POST",
										data: {"variant_sku":selcted_option_value},
										url: 'https://apps.freshtrends.com/API/Stock/estimated_time_delivery_instock.php',
										success:function(result) {
											//console.log(result);
											var obj = JSON.parse(result);
											if(obj.data == "in_stock"){
												if(obj.ships_in == "1 Day"){
													$(".product__shipping_estimated").html("In Stock. Ships in 1-2 Days<br/>Estimated shipping date: "+obj.estimated_date);
												}else{
													$(".product__shipping_estimated").html("In Stock. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
												}
												$(".update_custom_proudction_time").html(obj.ships_in);
											}else{
												$(".product__shipping_estimated").html("Made to order. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
												$(".update_custom_proudction_time").html(obj.ships_in);
											}
										}
									  });
									
								}
							   
							});
					}else{
						$('#SingleOptionSelector-0').children().remove();
						$('#SingleOptionSelector-1').children().remove();
						$('#SingleOptionSelector-2').children().remove();
						$("#SingleOptionSelector-0").append("<option value=''></option>");
						$("#SingleOptionSelector-1").append("<option value=''></option>");
						$("#SingleOptionSelector-2").append("<option value=''></option>");
						$(".update_custom_price").text("");
						$(".update_custom_price").attr("content","");
					}
				}
			  });
			}
        }else{
			var current_product_id = $(this).val();
			$.ajax({
				crossDomain: true,
				type:"POST",
				url: 'https://apps.freshtrends.com/API/Stock/in_stock.php',
				data: {product_id:current_product_id,checked:"No"},
				success:function(result) {
					//console.log(result);
					var data = $.parseJSON(result);
					//var i = 0;
						 $.each(data, function(index, value){
							 if(index == "option1"){
								 var arrayLength = data.option1.length;
								 $('#SingleOptionSelector-0').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									 if(i == 0){
										$("#SingleOptionSelector-0").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									 }else{
										 $("#SingleOptionSelector-0").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
							 }else if(index == "option2"){
								 var arrayLength = data.option2.length;
								 $('#SingleOptionSelector-1').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										$("#SingleOptionSelector-1").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-1").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
								
							 }else if(index == "option3"){
								  var arrayLength = data.option3.length;
								 $('#SingleOptionSelector-2').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
									
								 }
							 }
						});
						//check if id exist
						if( $('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length && $('#SingleOptionSelector-2').length){
							//console.log('test1');
							 var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val() +" / "+$('#SingleOptionSelector-2').find(":selected").val();
						}else if($('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length){
							//console.log('test2');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val();
						}else{
							//console.log('test3');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val();
						}
							//console.log(seleted_variant_select);
							$('.custom-select_instock > option').each((index, obj) => {
								
								if($.trim(seleted_variant_select) == $.trim($(obj).text())){
									var selcted_option_value = $.trim($(obj).val());
									var selected_variant = getUrlParameter('variant');
									var newUrl = location.href.replace("variant="+selected_variant, "variant="+selcted_option_value);
									update_url(newUrl);
									$(".custom-select_instock option:selected").removeAttr("selected");
									$(".custom-select_instock option[value='"+selcted_option_value+"']").attr('selected',true);
									
									//Get variant price 
									$.ajax({
										crossDomain: true,
										type:"POST",
										url: 'https://apps.freshtrends.com/API/Stock/get_variant_price.php',
										data: {variant_id:selcted_option_value},
										success:function(result) {
											//console.log(result);
											if(result != "error"){
												$(".update_custom_price").text("$"+result);
												$(".update_custom_price").attr("content",result+".0");
											}
										}
									});
									//Get estimated delivery time of variant
									$.ajax({
										crossDomain: true,
										type:"POST",
										data: {"variant_sku":selcted_option_value},
										url: 'https://apps.freshtrends.com/API/Stock/estimated_time_delivery_instock.php',
										success:function(result) {
											//console.log(result);
											var obj = JSON.parse(result);
											if(obj.data == "in_stock"){
												if(obj.ships_in == "1 Day"){
													$(".product__shipping_estimated").html("In Stock. Ships in 1-2 Days <br/>Estimated shipping date: "+obj.estimated_date);
												}else{
													$(".product__shipping_estimated").html("In Stock. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
												}
												$(".update_custom_proudction_time").html(obj.ships_in);
											}else{
												$(".product__shipping_estimated").html("Made to order. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
												$(".update_custom_proudction_time").html(obj.ships_in);
											}
										}
									  });
								}
							   
							});
					}
			  });
		}
    });
	
	/*********On change variant get in stock options ************/
	$("#SingleOptionSelector-0").on('change', function() {
		//e.preventDefault();
		 if($('input[name=togglevalue]').is(':checked')){
			var option_selected = $(this).find(":selected").val();
			//console.log(option_selected);
			var product_Id = $('input[name=togglevalue]').val();
			if(option_selected != "" && product_Id != ""){
				$.ajax({
					crossDomain: true,
					type:"POST",
					url: 'https://apps.freshtrends.com/API/Stock/in_stock_onchangevariant.php',
					data: {option_selected:option_selected,product_Id:product_Id},
					success:function(result) {
						//console.log(result);
						var data = $.parseJSON(result);
						 $.each(data, function(index, value){
							 if(index == "option1"){
								 var arrayLength = data.option1.length;
								 $('#SingleOptionSelector-0').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									 if(value[i] == option_selected){
										$("#SingleOptionSelector-0").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									 }else{
										 $("#SingleOptionSelector-0").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
							 }else if(index == "option2"){
								 var arrayLength = data.option2.length;
								 //console.log("array length1"+arrayLength);
								 $('#SingleOptionSelector-1').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										  //console.log("1st");
										$("#SingleOptionSelector-1").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-1").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
								
							 }else if(index == "option3"){
								  var arrayLength = data.option3.length;
								   //console.log("array length2"+arrayLength);
								 $('#SingleOptionSelector-2').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										    //console.log("1stsddd");
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
									
								 }
							 }
						});
						if( $('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length && $('#SingleOptionSelector-2').length){
							//console.log('test1');
							 var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val() +" / "+$('#SingleOptionSelector-2').find(":selected").val();
						}else if($('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length){
							//console.log('test2');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val();
						}else{
							//console.log('test3');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val();
						}
							//console.log(seleted_variant_select);
							$('.custom-select_instock > option').each((index, obj) => {
								
								if($.trim(seleted_variant_select) == $.trim($(obj).text())){
									var selcted_option_value = $.trim($(obj).val());
									var selected_variant = getUrlParameter('variant');
									var newUrl = location.href.replace("variant="+selected_variant, "variant="+selcted_option_value);
									update_url(newUrl);
									$(".custom-select_instock option:selected").removeAttr("selected");
									$(".custom-select_instock option[value='"+selcted_option_value+"']").attr('selected',true);
									
									//Get variant price 
									$.ajax({
										crossDomain: true,
										type:"POST",
										url: 'https://apps.freshtrends.com/API/Stock/get_variant_price.php',
										data: {variant_id:selcted_option_value},
										success:function(result) {
											//console.log(result);
											if(result != "error"){
												$(".update_custom_price").text("$"+result);
												$(".update_custom_price").attr("content",result+".0");
											}
										}
									});
									
									//Get estimated delivery time of variant
									$.ajax({
										crossDomain: true,
										type:"POST",
										data: {"variant_sku":selcted_option_value},
										url: 'https://apps.freshtrends.com/API/Stock/estimated_time_delivery_instock.php',
										success:function(result) {
											//console.log(result);
											var obj = JSON.parse(result);
											if(obj.data == "in_stock"){
												if(obj.ships_in == "1 Day"){
													$(".product__shipping_estimated").html("In Stock. Ships in 1-2 Days<br/>Estimated shipping date: "+obj.estimated_date);
												}else{
													$(".product__shipping_estimated").html("In Stock. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
												}
												
											}else{
												$(".product__shipping_estimated").html("Made to order. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
											}
											$(".update_custom_proudction_time").html(obj.ships_in);
										}
									  });
								}
							   
							}); 
					}
				});
			}
		 }
	});
	
	//on change option value 2 check in stock variants
	$("#SingleOptionSelector-1").on('change', function() {
		 if($('input[name=togglevalue]').is(':checked')){
			var option_selected2 = $(this).find(":selected").val();
			var option_selected1 = $('#SingleOptionSelector-0').find(":selected").val();
			var product_Id = $('input[name=togglevalue]').val();
			if(option_selected1 != "" && product_Id != "" && option_selected2 != ""){
				$.ajax({
					crossDomain: true,
					type:"POST",
					url: 'https://apps.freshtrends.com/API/Stock/in_stock_onchangevariant2.php',
					data: {option_selected2:option_selected2,product_Id:product_Id,option_selected1:option_selected1},
					success:function(result) {
						//console.log(result);
						var data = $.parseJSON(result);
						 $.each(data, function(index, value){
							 if(index == "option1"){
								 var arrayLength = data.option1.length;
								 $('#SingleOptionSelector-0').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									 if(i == 0){
										$("#SingleOptionSelector-0").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									 }else{
										 $("#SingleOptionSelector-0").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
							 }else if(index == "option2"){
								var arrayLength = data.option2.length;
								 $('#SingleOptionSelector-1').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									   if(value[i] == option_selected2){
										$("#SingleOptionSelector-1").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-1").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
								 }
								
							 }else if(index == "option3"){
								  var arrayLength = data.option3.length;
								 $('#SingleOptionSelector-2').children().remove();
								 for (var i = 0; i < arrayLength; i++) {
									  if(i == 0){
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"' selected='selected'>"+value[i]+"</option>");
									  }else{
										 $("#SingleOptionSelector-2").append("<option value='"+value[i]+"'>"+value[i]+"</option>");
									 }
									
								 }
							 } 
						}); 
						if( $('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length && $('#SingleOptionSelector-2').length){
							//console.log('test1');
							 var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val() +" / "+$('#SingleOptionSelector-2').find(":selected").val();
						}else if($('#SingleOptionSelector-0').length && $('#SingleOptionSelector-1').length){
							//console.log('test2');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val() +" / "+$('#SingleOptionSelector-1').find(":selected").val();
						}else{
							//console.log('test3');
							var seleted_variant_select = $('#SingleOptionSelector-0').find(":selected").val();
						}
						//console.log(seleted_variant_select);
						$('.custom-select_instock > option').each((index, obj) => {
							
							if($.trim(seleted_variant_select) == $.trim($(obj).text())){
								var selcted_option_value = $.trim($(obj).val());
								var selected_variant = getUrlParameter('variant');
								var newUrl = location.href.replace("variant="+selected_variant, "variant="+selcted_option_value);
								update_url(newUrl);
								$(".custom-select_instock option:selected").removeAttr("selected");
								$(".custom-select_instock option[value='"+selcted_option_value+"']").attr('selected',true);
								
								//Get variant price 
								$.ajax({
									crossDomain: true,
									type:"POST",
									url: 'https://apps.freshtrends.com/API/Stock/get_variant_price.php',
									data: {variant_id:selcted_option_value},
									success:function(result) {
										//console.log(result);
										if(result != "error"){
											$(".update_custom_price").text("$"+result);
											$(".update_custom_price").attr("content",result+".0");
										}
									}
									
								});
								//Get estimated delivery time of variant
									$.ajax({
										crossDomain: true,
										type:"POST",
										data: {"variant_sku":selcted_option_value},
										url: 'https://apps.freshtrends.com/API/Stock/estimated_time_delivery_instock.php',
										success:function(result) {
											//console.log(result);
											var obj = JSON.parse(result);
											if(obj.data == "in_stock"){
												if(obj.ships_in == "1 Day"){
													$(".product__shipping_estimated").html("In Stock. Ships in 1-2 Days<br/>Estimated shipping date: "+obj.estimated_date);
												}else{
													$(".product__shipping_estimated").html("In Stock. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
												}
											}else{
												$(".product__shipping_estimated").html("Made to order. Ships in "+obj.ships_in+ '<br/>'+"Estimated shipping date: "+obj.estimated_date);
											}
											$(".update_custom_proudction_time").html(obj.ships_in);
										}
									  });
							}
						   
						});
						
						
					}
				});
			}
		 }
	});

});

