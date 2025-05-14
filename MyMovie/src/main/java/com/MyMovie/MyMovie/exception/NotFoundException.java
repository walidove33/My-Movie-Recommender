// NotFoundException.java
package com.MyMovie.MyMovie.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}