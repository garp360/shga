package com.hb.shga.model;

import javax.xml.bind.annotation.XmlRootElement;


@XmlRootElement
public class GolfCourse {
	private String id;
	private String name;
	private Integer length;

	public GolfCourse() {
		super();
	}

	public GolfCourse(String id, String name, Integer length) {
		super();
		this.id = id;
		this.name = name;
		this.length = length;
	}
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getLength() {
		return length;
	}
	public void setLength(Integer length) {
		this.length = length;
	}
}
