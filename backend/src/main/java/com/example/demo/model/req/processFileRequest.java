package com.example.demo.model.req;

import lombok.Data;
import net.sf.oval.constraint.Min;
import net.sf.oval.constraint.NotNull;

@Data
public class processFileRequest {
    @Min(value = 0, message = "folder id can not be negative")
    private int folder_id;
}
