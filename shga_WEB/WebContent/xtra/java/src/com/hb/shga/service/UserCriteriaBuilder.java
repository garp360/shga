package com.hb.shga.service;

import com.google.gson.Gson;

public class UserCriteriaBuilder {
	
	public static UserCriteria build(String json) {
		Gson gson = new Gson();
		UserCriteria criteria = gson.fromJson(json, UserCriteria.class);
		
		return criteria;
	}

	public static UserCriteria build(String[] firstName, String[] lastName) {
		UserCriteria criteria = new UserCriteria();
		criteria.setFirstName(firstName);
		criteria.setLastName(lastName);
		return criteria;
	}
}
