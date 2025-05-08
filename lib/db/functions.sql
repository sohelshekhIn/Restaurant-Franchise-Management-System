DELIMITER //

CREATE FUNCTION calculate_avg_salary_by_dept(
    p_restaurantId INT,
    p_departmentId INT
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_avgSalary DECIMAL(10,2);
    
    -- Calculate average salary for employees in the specified department and restaurant
    SELECT COALESCE(AVG(CAST(MonthlySalary AS DECIMAL(10,2))), 0) INTO v_avgSalary
    FROM employee
    WHERE RestaurantId = p_restaurantId
    AND DepartmentId = p_departmentId;
    
    -- Return the average salary
    RETURN v_avgSalary;
END //

DELIMITER ; 