import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">About</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Details about the course and project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Course Name</h3>
                <p className="text-muted-foreground">
                  Database Management Systems
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Course Number</h3>
                <p className="text-muted-foreground">DBAS 32100</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Class Number</h3>
                <p className="text-muted-foreground">1251_93172</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Group Number</h3>
                <p className="text-muted-foreground">Group 10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>Our team members</CardDescription>
            {/* <CardDescription>
              Our team members and their contributions
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Team Members</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sohel Shekh</p>
                      <p className="text-sm text-muted-foreground">
                        Student ID: 991759597
                      </p>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">
                      Frontend Development, UI/UX Design
                    </p> */}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Navrose Singh Johal</p>
                      <p className="text-sm text-muted-foreground">
                        Student ID: 991745899
                      </p>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">
                      Backend Development, API Integration
                    </p> */}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Quoc Huy Le</p>
                      <p className="text-sm text-muted-foreground">
                        Student ID: 991695500
                      </p>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">
                      Database Optimization, Testing
                    </p> */}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Aryal Kriti</p>
                      <p className="text-sm text-muted-foreground">
                        Student ID: 991752533``
                      </p>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">
                      Documentation, Quality Assurance
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>
              About the Restaurant Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                The Restaurant Management System is a comprehensive web
                application designed to help restaurant owners and managers
                streamline their operations. The system provides tools for
                managing restaurants, menus, employees, inventory, and financial
                data.
              </p>
              <p>
                This project was developed as part of our Database Management
                Systems course, demonstrating the practical application of
                database design, normalization, and management in a real-world
                scenario.
              </p>
              <p>
                The system is built using modern web technologies including
                Next.js, React, TypeScript, and MySQL, providing a robust and
                user-friendly interface for restaurant management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
