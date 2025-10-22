import { BuyerProfile } from "src/BuyerProfile/Entity/BuyerProfile.entity";
import { ProjectResponseDTO } from "src/Project/DTOs/projectResponse.dto";
import { Project } from "src/Project/entity/project.entity";
import { SellerProfile } from "src/Seller/Entity/SellerProfile.entity";
import { UserResponseDTO } from "src/User/DTOs/userResponse.dto";
import { User } from "src/User/Entities/User.entity";

export class mapperService{


    public  mapToProjectDTO(project: Project): Partial<ProjectResponseDTO> {
  return {
    id: project.id,
          title: project.title,
          outline: project.outline,
          requirements: project.requirements,
          budgetRange: project.budgetRange,
          timeline: project.timeline,
          attachment: project.attachment ?? '',
          status: project.status,
            skillsRequired:
          Array.isArray(project.skillsRequired)
            ? project.skillsRequired
            : project.skillsRequired
            ? String(project.skillsRequired).split(',').map((s) => s.trim())
            : [],
  };
}
public mapToUserDTO(user: User, profile?: BuyerProfile | SellerProfile | null): Partial<UserResponseDTO> {
  return {
    id: user.id,
    firstName: user.firstName,
    middleName: user.middleName ?? '',
    lastName: user.lastName,
    email: user.email,
    role: user.role ? { id: user.role.id, name: user.role.name } : undefined,
    contact: user.contact ?? undefined,
    company: user.company ?? undefined,
    profile: profile
      ? {
          id: profile.id,
          contact: profile.contact,
          company: profile.company,
          acceptedTerms: (profile as any).acceptedTerms ?? false,
        }
      : undefined,
  };
}

}