package com.hb.shga.service;

import java.util.Arrays;

public class UserCriteria {
	String[] firstName;
	String[] lastName;

	public String[] getFirstName() {
		return firstName;
	}

	public void setFirstName(String[] firstName) {
		this.firstName = firstName;
	}

	public String[] getLastName() {
		return lastName;
	}

	public void setLastName(String[] lastName) {
		this.lastName = lastName;
	}

	@Override
	public String toString() {
		return "UserCriteria [firstName=" + Arrays.toString(firstName)
				+ ", lastName=" + Arrays.toString(lastName) + "]";
	}

}
