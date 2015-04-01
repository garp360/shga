package com.hb.shga;

import org.glassfish.jersey.server.ResourceConfig;

import com.hb.shga.service.impl.UserServiceImpl;


public class ShgaProvider extends ResourceConfig {

    /**
     * Register JAX-RS application components.
     */
    public ShgaProvider () {
        register(UserServiceImpl.class);
    }
}

