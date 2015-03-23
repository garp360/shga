package com.hb.shga.model;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class User {
	private String id;
	private String firstname;
	private String lastname;
	private Float hcp;
	private Date effectiveDate;
	private Boolean isActive = false;
	private Set<GolfCourse> golfCourses = new HashSet<GolfCourse>();
	
	public User(String id, String firstname, String lastname) {
		super();
		this.id = id;
		this.firstname = firstname;
		this.lastname = lastname;
	}
	
	public User(String id, String firstname, String lastname, Float hcp, Date effectiveDate) {
		super();
		this.id = id;
		this.firstname = firstname;
		this.lastname = lastname;
		this.hcp = hcp;
		this.effectiveDate = effectiveDate;
	}

	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getFirstname() {
		return firstname;
	}
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	public String getLastname() {
		return lastname;
	}
	public void setLastname(String lastname) {
		this.lastname = lastname;
	}
	public Set<GolfCourse> getGolfCourses() {
		return golfCourses;
	}
	public void setGolfCourses(Set<GolfCourse> golfCourses) {
		this.golfCourses = golfCourses;
	}
	public Boolean getIsActive() {
		return isActive;
	}
	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
	public Float getHcp() {
		return hcp;
	}
	public void setHcp(Float hcp) {
		this.hcp = hcp;
	}
	public Date getEffectiveDate() {
		return effectiveDate;
	}
	public void setEffectiveDate(Date effectiveDate) {
		this.effectiveDate = effectiveDate;
	}
}
