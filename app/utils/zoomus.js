//var ZM_DEBUG = true;
window.log = function(msg) {
	if (window.console && window.console.log /**&& ZM_DEBUG**/) {
		window.console.log(msg);
	}
};

function supportCORS(){
	var support = false;
	if(window.XMLHttpRequest){
		var xhr = new XMLHttpRequest();
		support = xhr.withCredentials != undefined;
	}
	$.support.cors = true;
	return support;
}

function commonError(resp){
	log("Code:" + resp.errorCode + " Message:" + resp.errorMessage)
}

var Zoom = {
	//key_type:"api",
	//_apikey:'',
	//_signature:'',
	_access_token:'',
	endpoint:'https://zoom.us/api/v1',
	/**
	 init:function(apiKey,endpoint,type){
			this._apikey = apiKey;
			this.key_type=type;
			this.endpoint = endpoint
		},
	 **/
	init:function(endpoint){
		this.endpoint = endpoint;
	},
	isLogin:function(){
		if(this._access_token === ''){
			this._access_token = Zoom.Store.get('access_token');
		}
		return this._access_token && this._access_token.length > 0;
	},

	login:function(params, success, error){
		var self = this;
		var method = "user.signin";
		/**
		 if(this.key_type == Zoom.APIType.LTI){
	    		method = "user.signinLTI";
	    	}
		 **/
		if (!$.isFunction(error)) {
			error = commonError;
		}
		this.api(method,params,function(resp){
			if(resp.status){
				self._access_token=resp.result.access_token;
				Zoom.Store.set("access_token",self._access_token);
				success(resp.result);
			}else{
				if(resp.error && resp.error != undefined){
					error(resp.error);
				}else{
					error(resp);
				}
			}
		});
	},

	logout:function(){
		var self = this;
		if(this.isLogin()){
			this.api("user.logout",{},function(resp){
				self._access_token="";
				Zoom.Store.set("access_token","");
			});
		}
	},

	api:function(apiMethod, params,  callback){
		//log('JS API: ' + apiMethod);
		params.method  = apiMethod;
		//params.api_key = this._apikey;
		if(this.isLogin()){
			params._zm_ssid = this._access_token;
		}

		this._postCORS(this.endpoint, params, callback);
	},

	listMeeting:function(params, success, error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.list",params, function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},

	getMeeting:function(params, success, error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.get",params, function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},
	createMeeting:function(params, success, error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.create",params,function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},
	deleteMeeting:function(params, success, error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.delete",params,function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},
	updateMeeting:function(params, success, error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.update",params,function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},
	endMeeting:function(params, success, error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.end",params,function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},

	getPMI:function(success,error){
		if (!$.isFunction(error)) {
			error = commonError;
		}
		if(this.isLogin()){
			this.api("meeting.pmi",{},function(resp){
				if(resp.status){
					success(resp.result);
				}else{
					log("login failed,code="+resp.errorCode + " message=" + resp.errorMessage );
					error(resp);
				}});
		}else{
			error({'status':false,'errorCode':201,'errorMessage':'please login first'});
			log("please login first");
		}
	},

	_postCORS: function (url, data, callback)
	{
		try {
			if(supportCORS()){
				log( 'XMLRequest POST ' + 'API: ' + data.method);
				/**
				 var request = $.ajax({
						url: url,
						method: "POST",
						//xhrFields: { withCredentials: true },
						data: data,
						dataType: "json"
					});
				 request.done(function(resp) {
						callback(resp);
					});

				 request.fail(function(jqXHR, textStatus, error) {
						log("Zoom JavaScript API error: " + error);
					});
				 **/
				$.post(url, data, callback, 'json')
						.fail(function (jqXHR, textStatus, error) {
							log("Zoom JavaScript API error: " + error);
						});
			}else{
				log('JSONP GET ' + 'API: ' + data.method);
				$.get(url, data, callback, 'jsonp');
			}
		} catch(e) {
			log("You brower cannot support CORS!");
		}
	}
};

Zoom.Store={
	get:function(key){
		if(window.sessionStorage != undefined){
			return window.sessionStorage.getItem(key);
		}else{
			return null;
		}
	},
	set:function(key,val){
		if(window.sessionStorage != undefined){
			window.sessionStorage.setItem(key,val);
		}
	}
};
/**
 Zoom.APIType={
		API:'api',
		LTI:'lti'
	};
 **/