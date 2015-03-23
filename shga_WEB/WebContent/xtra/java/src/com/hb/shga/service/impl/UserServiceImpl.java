package com.hb.shga.service.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.hb.shga.model.GolfCourse;
import com.hb.shga.model.User;
import com.hb.shga.service.UserService;

@Path("/users")
public class UserServiceImpl implements UserService {
	private static List<User> users = Collections.synchronizedList(new ArrayList<User>());

	private static List<GolfCourse> golfCourses;

	public UserServiceImpl() {
		if (users == null || golfCourses == null) {
			init();
		}
	}

	private void init() {
		golfCourses = new ArrayList<GolfCourse>();
//		golfCourses.add(createGolfCourse("1", "Baltustrol", 7232));
//		golfCourses.add(createGolfCourse("2", "Whistling Straits", 6988));
//		golfCourses.add(createGolfCourse("3", "Augusta National", 7121));
//		golfCourses.add(createGolfCourse("4", "Pine Valley", 6889));
//		golfCourses.add(createGolfCourse("5", "TPC Sawgrass", 7072));
//		golfCourses.add(createGolfCourse("6", "Forsgate", 7469));
//		golfCourses.add(createGolfCourse("7", "Beth Page", 7595));

		users = new ArrayList<User>();
	}

//	private User createUser(String id, String firstname, String lastname) {
//		User user = new User(id, firstname, lastname);
//		addGolfCourses(user);
//		return user;
//	}
//
//	private GolfCourse createGolfCourse(String id, String name, Integer length) {
//		GolfCourse golfCourse = new GolfCourse(id, name, length);
//		return golfCourse;
//	}
//
//	private void addGolfCourses(User user) {
//		Set<GolfCourse> userGolfCourses = new HashSet<GolfCourse>();
//		Random random = new Random();
//		for (int i = 0; i < 4; i++) {
//			int gcId = random.nextInt(7);
//			userGolfCourses.add(golfCourses.get(gcId));
//		}
//		user.setGolfCourses(userGolfCourses);
//	}

	@Path("/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String findById(@Context HttpHeaders headers,
			@PathParam("id") String id) {
		User value = getUser(id);

		Gson gson = new Gson();
		String json = gson.toJson(value);
		return json;
	}

	@Path("/search")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String search(@Context HttpHeaders headers,
			@DefaultValue("") @QueryParam("firstName") String firstName,
			@DefaultValue("") @QueryParam("lastName") String lastName,
			@DefaultValue("flike") @QueryParam("match") String match) {

		return searchUsers(firstName, lastName);
	}

	private String searchUsers(String firstName, String lastName) {
		List<User> allUsers = (firstName.isEmpty() && lastName.isEmpty()) ? new ArrayList<User>(users) : new ArrayList<User>();

		if (allUsers.isEmpty()) {
			for (User user : users) {
				if ((!firstName.isEmpty() && user.getFirstname().toUpperCase().startsWith(
						firstName.toUpperCase()))
						|| (!lastName.isEmpty() && user.getLastname().toUpperCase()
								.startsWith(lastName.toUpperCase()))) {
					allUsers.add(user);
				}
			}
		}

		User[] array = allUsers.toArray(new User[] {});
		Gson gson = new Gson();
		String json = gson.toJson(array);
		return json;
	}

	@Path("/delete")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String deleteUser(@Context HttpHeaders headers,
			@QueryParam("deleteId") String userId,
			@DefaultValue("") @QueryParam("firstName") String firstName,
			@DefaultValue("") @QueryParam("lastName") String lastName) {
		User value = getUser(userId);

		users.remove(value);

		return searchUsers(firstName, lastName);
	}

	private User getUser(String userId) {
		User value = null;
		for (User user : users) {
			if (user.getId().equals(userId)) {
				value = user;
				break;
			}
		}
		return value;
	}

	private User getUser(String firstName, String lastName) {
		User value = null;
		for (User user : users) {
			if (user.getFirstname().equalsIgnoreCase(firstName) && user.getLastname().equalsIgnoreCase(lastName)) {
				value = user;
				break;
			}
		}
		return value;
	}

	@Path("/update/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String updateUser(@Context HttpHeaders headers,
			@PathParam("id") String userId,
			@QueryParam("isActive") Boolean isActive,
			@DefaultValue("") @QueryParam("firstName") String firstName,
			@DefaultValue("") @QueryParam("lastName") String lastName) {
		User original = getUser(userId);
		if(original != null) {
			original.setFirstname(firstName);
			original.setLastname(lastName);
			original.setIsActive(isActive);
		}
		Gson gson = new Gson();
		String json = gson.toJson(original);
		return json;
	}
	
	@Path("/create")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String create(@Context HttpHeaders headers,
			@DefaultValue("") @QueryParam("firstName") String firstName,
			@DefaultValue("") @QueryParam("lastName") String lastName) {
		String userId = UUID.randomUUID().toString();
		User user = new User(userId, firstName, lastName);
		users.add(user);
		return searchUsers(firstName, lastName);
	}

	@Path("/import")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response importUser(String json) {
		Gson gson = new GsonBuilder().setDateFormat("yyyyMMdd").create();
		Collection<User> importedUsers =  gson.fromJson(json, new TypeToken<List<User>>(){}.getType());
		for (User importedUser : importedUsers) {
			User existingUser = getUser(importedUser.getFirstname(), importedUser.getLastname());
			
			if(existingUser == null) {
				String userId = UUID.randomUUID().toString();
				User newUser = new User(userId, importedUser.getFirstname(), importedUser.getLastname(), importedUser.getHcp(), importedUser.getEffectiveDate());
				users.add(newUser);
			} else {
				existingUser.setHcp(importedUser.getHcp());
				existingUser.setEffectiveDate(importedUser.getEffectiveDate());
			}
		}

		return Response.status(201).build();
	}	
	
}
