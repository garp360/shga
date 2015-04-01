package com.hb.shga.service;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;

public interface UserService {
	public String findById(@Context HttpHeaders headers, @PathParam("id") String id);
	
    public String search(	
    		@Context HttpHeaders headers,
    		@DefaultValue("") @QueryParam("firstName") String firstName, 
    		@DefaultValue("") @QueryParam("lastName") String lastName,
    		@DefaultValue("flike") @QueryParam("match") String match);
    
    public String deleteUser(
    		@Context HttpHeaders headers,
    		@QueryParam("deleteId") String userId, 
    		@DefaultValue("") @QueryParam("firstName") String firstName, 
    		@DefaultValue("") @QueryParam("lastName") String lastName);
}
