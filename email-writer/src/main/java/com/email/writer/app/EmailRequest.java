package com.email.writer.app;

import lombok.Data;

@Data
public class EmailRequest {
    private String content;
    private String tone;
}
