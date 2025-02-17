//package com.example.app.Listener;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.event.ContextClosedEvent;
//import org.springframework.context.event.EventListener;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.stereotype.Component;
//
//import java.io.FileWriter;
//import java.io.IOException;
//import java.util.List;
//import java.util.Map;
//
//@Component
//public class DataExporter {
//
//    @Autowired
//    private JdbcTemplate jdbcTemplate;
//
//    @EventListener(ContextClosedEvent.class)
//    public void exportData() {
//        try (FileWriter fileWriter = new FileWriter("src/main/resources/cctv1.sql")) {
//            List<Map<String, Object>> data = jdbcTemplate.queryForList("SELECT * FROM cctv1");
//
//            for (Map<String, Object> row : data) {
//                StringBuilder insertStatement = new StringBuilder("INSERT IGNORE INTO cctv1 (column1, column2) VALUES ");
//                insertStatement.append("(");
//                // 컬럼별 데이터를 추가
//                insertStatement.append(");\n");
//                fileWriter.write(insertStatement.toString());
//            }
//
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//}
